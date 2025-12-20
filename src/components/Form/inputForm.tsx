import { useState } from 'react'
import { Label } from '../ui/label'
import { Eye, EyeClosed, Lock, Mail } from 'lucide-react'

interface InputProps {
    id:string,
    label?: string,
    type?: "text" | "email" | "password",
    placeholder ?: string,
    value:string,
    onFocus:()=>void,
    onChange: (e:React.ChangeEvent<HTMLInputElement>) => void,
    icon?: "mail"| "lock",
    error?:string
    className?:string
}

const InputForm = ({id,label,type,placeholder,value,onFocus,onChange,error,icon,className}:InputProps) => {
    const [showPassword,setshowPassword] = useState(false)
    const renderIcon = ()=>{
        if(icon === "mail") return <Mail size={18} />
        if(icon === "lock") return <Lock size={18} />
        return null
    }
  return (
    <div className='flex w-full flex-col gap-1'>
        <Label htmlFor={id}>{label}</Label>
        <div className={`flex w-full items-center gap-2 rounded-md border p-2 dark:border-gray-300 ${error && 'border-red-400 bg-red-100'}`}>
            {renderIcon()}
            <input 
                id={id}
                type={type === "password" ? (showPassword ? "text" : "password") : type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onFocus={onFocus}
                required
                className={`w-full font-bold outline-0 placeholder:font-normal ${className}`}
            />
            {type === "password" && (
                <div onClick={()=>setshowPassword(!showPassword)} className='cursor-pointer'>
                    {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </div>
            )}
            </div>
            {error && <p className='text-sm font-semibold text-red-400'>{error}</p>}
    </div>
  )
}

export default InputForm