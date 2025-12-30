import Image from "next/image"
import image_enterprise from '../../../../public/assets/images/enterprise/Hiring-amico.png'
const SidebarNav = () => {
  return (
    <div className="p-2 flex items-center justify-center flex-col gap-2">
      <div className="border-2 rounded-md">
        <Image src={image_enterprise} alt="image_de_enterprise" height={100}/>
      </div>
      <div>
        <h4>Nom de l&apos;entreprise</h4>
      </div>
    </div>
  )
}

export default SidebarNav