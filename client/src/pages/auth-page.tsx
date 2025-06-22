import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, LogIn, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  signature: z.string().min(1, "La firma es requerida").startsWith("#", "La firma debe comenzar con #"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.extend({
      signature: z.string().min(1, "La firma es requerida").startsWith("#", "La firma debe comenzar con #"),
      fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      age: z.number().min(13, "Debes tener al menos 13 años").max(100, "Edad inválida"),
      birthday: z.string().regex(/^\d{2}\/\d{2}$/, "Formato debe ser dd/mm"),
      faceClaim: z.string().min(1, "El face claim es requerido"),
      facebookLink: z.string().url("Deve ser una URL válida"),
      motivation: z.string().min(20, "La motivación debe tener al menos 20 caracteres"),
    })),
    defaultValues: {
      fullName: "",
      age: 18,
      birthday: "",
      faceClaim: "",
      signature: "#",
      facebookLink: "",
      motivation: "",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      signature: "#",
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lavender" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/portal" />;
  }

  const onRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <Link to="/">
            <Button variant="ghost" className="text-lavender hover:text-white transition-colors mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">Acceso</h1>
          <p className="text-gray-300 text-lg">Únete a nuestra comunidad artística</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-effect">
            <TabsTrigger value="login" className="data-[state=active]:bg-lavender data-[state=active]:text-black">
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-lavender data-[state=active]:text-black">
              Registrarse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="fade-in">
            <Card className="glass-effect border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-white font-serif">Iniciar Sesión</CardTitle>
                <p className="text-center text-gray-300">Ingresa con tu firma única</p>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Tu Firma</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-black/50 border-gray-600 text-center text-lg focus:border-lavender text-white"
                              placeholder="#TuFirma"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full glass-effect hover-glow px-8 py-4 text-lg font-medium transition-all duration-300 glow-effect border-2 border-lavender text-lavender hover:bg-lavender hover:text-black bg-transparent"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <LogIn className="mr-3 h-5 w-5" />
                      )}
                      Acceder
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="fade-in">
            <Card className="glass-effect border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-white font-serif">Registro</CardTitle>
                <p className="text-center text-gray-300">Únete a nuestra comunidad</p>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Nombre y Apellido</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                                placeholder="Tu nombre completo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Edad</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                                placeholder="Tu edad"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={registerForm.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Cumpleaños (dd/mm)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                                placeholder="15/06"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="faceClaim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Face Claim</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                                placeholder="Tu face claim"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Firma (con # al inicio)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                              placeholder="#TuFirmaUnica"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="facebookLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Link de Facebook</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="url"
                              className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                              placeholder="https://facebook.com/tu-perfil"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">¿Por qué desea ingresar al proyecto?</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              className="bg-black/50 border-gray-600 focus:border-lavender resize-none text-white"
                              placeholder="Comparte tu motivación para unirte..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full glass-effect hover-glow px-8 py-4 text-lg font-medium transition-all duration-300 glow-effect border-2 border-lavender text-lavender hover:bg-lavender hover:text-black bg-transparent"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <UserPlus className="mr-3 h-5 w-5" />
                      )}
                      Enviar Registro
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
