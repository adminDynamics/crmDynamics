import { MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-gray-900">CRM Messages</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2">
        <Button
          variant="secondary"
          className="w-full justify-start mb-1 bg-purple-100 text-purple-700 hover:bg-purple-100"
        >
          <MessageSquare className="w-4 h-4 mr-3" />
          Conversaciones
        </Button>
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
          <LogOut className="w-4 h-4 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
