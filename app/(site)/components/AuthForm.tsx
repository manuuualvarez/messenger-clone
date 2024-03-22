'use client'

import Button from '@/app/components/Button';
import Input from '@/app/components/inputs/Input';
import  { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import AuthSocialButton from './AuthSocialButton';
import { BsGithub, BsGoogle } from 'react-icons/bs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';

type Variant = 'login' | 'register'

const AuthForm = () => {

    const [variant, setvariant] = useState<Variant>('login');
    const [isLoading, setisLoading] = useState(false);

    const handleToggle = useCallback(() => {
        if (variant === 'login') {
            setvariant('register');
        } else {
            setvariant('login');
        }
    }, [variant]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    useEffect(() => {
        reset();
    }, [variant]);

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setisLoading(true);
        
        if (variant === 'login') {
             // Login - NextAuth server
             signIn('credentials', {
                ...data,
                redirect: false,
             })
             .then((callback) => {
                if (callback?.error) {
                    toast.error('Invalid credentials');
                } 

                if (callback?.ok && !callback.error) {
                    toast.success('Logged in');
                }
             })
             .finally(() => setisLoading(false));
        } 

        if (variant === 'register') {
            // Axios Register - Call HTTP
            axios.post('/api/register', data)
            .catch((error) => toast.error('Something went wrong'))
            .finally(() => setisLoading(false));
        }
    }

    const socialAction = (action: string) => {
        setisLoading(true);
        signIn(action, { redirect: false })
        .then((callback) => {
            if (callback?.error) {
                toast.error('Something went wrong!');
            }
            if (callback?.ok && !callback.error) {
                toast.success('Logged in!');
            }
         })
         .finally(() => setisLoading(false));
    }


  return (
    <div
        className='
            mt-8
            sm:mx-auto
            sm:w-full
            sm:max-w-md
        '
    >

        {/* Card */}
      <div
        className='
            bg-white
            px-4
            py-8
            shadow
            sm:rounded-lg
            sm:px-10
        '
      >
        <form
            className='space-y-6'
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* Inputs */}
            {
                variant === 'register' && (
                    <Input 
                        id='name' 
                        label='Full Name' 
                        register={register} 
                        errors={errors}
                        disabled={isLoading}
                    />
                )
            
            }
            <Input 
                id='email' 
                label='Email address' 
                register={register} 
                errors={errors}
                disabled={isLoading}
            />
            <Input 
                id='password' 
                label='Password' 
                type='password'
                register={register} 
                errors={errors}
                disabled={isLoading}
            />


            <div>
                <Button
                    disabled={isLoading}
                    fullWidth
                    type='submit'
                >
                    {variant === 'login' ? 'Sign in' : 'Register'}
                </Button>
            </div>
        </form>
        
        {/* Options */}
        <div className='mt-6'>
            <div className='relative'>
                <div
                    className='
                    absolute 
                    inset-0 
                    flex 
                    items-center'
                >
                    {/* Divider */}
                    <div className='w-full border-t border-gray-300'/>

                </div>

                <div className='
                    relative flex justify-center text-sm 
                '>
                    <span className='bg-white px-2 text-gray-500'>Or continue with</span>
                </div>
            </div>

            {/* Social Media */}
            <div className='mt-6 flex gap-2'>
                <AuthSocialButton
                    icon={BsGithub}
                    onClick={() => socialAction('github')}
                />
                <AuthSocialButton
                    icon={BsGoogle}
                    onClick={() => socialAction('google')}
                />
            </div>
        </div>

        {/* Change Method */}
        <div className='
            flex
            gap-2
            justify-center
            text-sm
            mt-6
            px-2
            text-gray-500
        '
        >
            <div>
                { variant === 'login' ? 'New to messenger?' : 'Already registered?'}
            </div>
            <div
                onClick={handleToggle}
                className='underline cursor-pointer'
            >
                { variant === 'login' ? 'Create an account' : 'Sign in'}
            </div>
        </div>


      </div>

    </div>
  )
}

export default AuthForm
