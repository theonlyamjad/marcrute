"use client"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react'

const SignupPage = () => {
  const [formData,setFormData]=useState({
    email:"",
    password:"",
    confirmPassword:""
  });

  const [errformData,seterrFormData]=useState({
    email:"",
    password:"",
    confirmPassword:""
  });

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const {id,value} = e.target;
    setFormData((prev)=>({
      ...prev,
      [id]:value
    }))
  };

  const handleFocus = (value:string)=>{
    seterrFormData((prev)=>({
      ...prev,
      [value]:""
    }))
  };

  return (
    <div className='flex items-center justify-between w-full min-h-dvh'>
      <div className='w-full p-4 space-y-2'>
        <div className='w-full space-y-2'>
          <h1>MARcrute LoOGO</h1>
          <h1 className='text-gray-800 text-2xl font-bold'>Je crée mon compte</h1>
            <p className="text-sm text-gray-500">
              Déjà inscrit ?{" "}
              <Link href="/" className="font-semibold text-cyan-700 hover:underline">
                Connectez-vous
              </Link>
            </p>          
          <OAuth text_1='Sinscrire avec Google' text_2='Sinscrire avec Microsoft'/>
        </div>
        <form className='w-full flex items-center justify-center flex-col space-y-2'>
        <InputForm 
          id='email' 
          label='Email'
          placeholder='Tapez votre email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          icon='mail'
          onFocus={()=>handleFocus("email")}
        />
        <InputForm 
          id='password' 
          label='Mot de passe'
          placeholder='******'
          type='password'
          value={formData.password}
          onChange={handleChange}
          icon='lock'
          onFocus={()=>handleFocus("password")}
        />
        <InputForm 
          id='confirmPassword' 
          label='Comfirmer votre Mot de passe'
          placeholder='Confirmer le mot de passe'
          type='password'
          value={formData.confirmPassword}
          onChange={handleChange}
          icon='lock'
          onFocus={()=>handleFocus("confirmPassword")}
        />
        <Button className="mt-2 w-full bg-gray-900 py-5 text-base font-semibold hover:bg-gray-800 cursor-pointer">
              Créer mon compte
        </Button>        
      </form> 
      </div>
      <div className='w-full bg-cyan-500 min-h-dvh hidden lg:flex items-center justify-center'>
        <div className='mt-9 p-4 flex items-center flex-col max-w-full justify-between space-y-8'>
          <div className='p-2 rounded-md text-2xl bg-gray-50 font-bold w-full'>
            <h1>MARcrute est 100 % Marocaine</h1>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full mt-4 text-xl -rotate-3'>
            <h2>✓ +300 000 Free-Workers actifs</h2>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full text-xl mt-4 rotate-3'>
            <h2>✓ +300 000 Free-Workers actifs</h2>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full text-xl mt-4 -rotate-3'>
            <h2>✓ +4 000 recruteurs spécialisés dans <br/>l’informatique</h2>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full text-xl mt-4 rotate-3'>
            <h2>✓ Choisissez la visibilité de votre profil</h2>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full text-xl mt-4 -rotate-3'>
            <h2>✓ Retrouvez la plus grosse communauté d’indépendants</h2>
          </div>
          <div className='p-2 rounded-md bg-cyan-300 w-full text-xl mt-4 rotate-3'>
            <h2>✓ Suivez les dernières actualités tech</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
