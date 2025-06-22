import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/portal" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-lavender rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-pale-gold rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>
      
      <div className="text-center z-10 max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-6xl md:text-8xl font-bold mb-8 text-shadow tracking-wide text-white">
          𝐈𝐧𝐭𝐫𝐨𝐬𝐩𝐞𝐧𝐬
        </h1>
        <h2 className="font-serif text-2xl md:text-3xl mb-4 text-lavender italic tracking-wider">
          /𝒂𝒓𝒕𝒆/
        </h2>
        <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Un espacio donde las palabras cobran vida y los sentimientos encuentran su forma más pura
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/auth">
            <Button className="glass-effect hover-glow px-12 py-4 text-lg font-medium transition-all duration-300 glow-effect border-2 border-lavender text-lavender hover:bg-lavender hover:text-black min-w-[200px] bg-transparent">
              <UserPlus className="mr-3 h-5 w-5" />
              Registrarse
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="glass-effect hover-glow px-12 py-4 text-lg font-medium transition-all duration-300 border-2 border-white hover:bg-white hover:text-black min-w-[200px] bg-transparent">
              <LogIn className="mr-3 h-5 w-5" />
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
