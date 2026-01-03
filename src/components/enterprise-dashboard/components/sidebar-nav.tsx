import Image from "next/image"
import { useSession } from "next-auth/react"
import { Building2 } from "lucide-react";
const SidebarNav = () => {
  const {data:session} = useSession();
  return (
    <div className="p-2 flex items-center justify-center flex-col gap-2">
      <div className="rounded-md">
        <Building2 size={70}/>
      </div>
      <div>
        <h2 className="font-bold text-lg">{session?.user?.name}</h2>
      </div>
    </div>
  )
}

export default SidebarNav