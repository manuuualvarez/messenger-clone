import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {

  try {
    // Check user session
    const currentUser = await getCurrentUser();
    // Get the data from the request
    const body = await request.json();
    const { userId, isGroup, members, name } = body;
    // If current user does not exist, return unauthorized
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // If the request is a Group, and the members or name are not provided, return a bad request
    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse('Invalid data', { status: 400 });
    }
    //* Group conversation
    if (isGroup) {
      // Create a new conversation
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({  
                id: member.value 
              })),
              {
                id: currentUser.id
              }
            ]
          }
        },
        include: {
          users: true,
        }
      });
       // Update all connections with new conversation
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, 'conversation:new', newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }
    //* 1:1 conversation
    const existingConversations = await prisma.conversation.findMany({
      where: {
        // Depends on who create the conversation, for this reason use OR
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId]
            }
          },
          {
            userIds: {
              equals: [userId, currentUser.id]
            }
          }
        ]
      }
    });
    // Take the first conversation, should not exist two, but prisma does not have a findOne method
    const singleConversation = existingConversations[0];
    // If the conversation already exists, return it
    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }
    // Else Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id
            },
            {
              id: userId
            }
          ]
        }
      },
      include: {
        users: true
      }
    });
    // Update all connections with new conversation
    newConversation.users.map((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:new', newConversation);
      }
    });
    // Return the new conversation
    return NextResponse.json(newConversation)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}