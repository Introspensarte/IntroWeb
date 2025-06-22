import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Newspaper, 
  Bell, 
  FileText, 
  Upload, 
  Trophy, 
  LogOut,
  Calendar,
  MapPin,
  PenTool,
  MessageSquare,
  BookOpen,
  Medal,
  Loader2,
  Crown
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivitySchema, InsertActivity, User as UserType, RANK_MEDALS } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const activityFormSchema = insertActivitySchema.extend({
  date: z.string().min(1, "La fecha es requerida"),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

export default function PortalPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [calculatedTrazos, setCalculatedTrazos] = useState<number | null>(null);

  // Queries
  const { data: userActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: trazosRanking, isLoading: trazosLoading } = useQuery({
    queryKey: ["/api/rankings/trazos"],
    enabled: activeTab === "rankings",
  });

  const { data: wordsRanking, isLoading: wordsLoading } = useQuery({
    queryKey: ["/api/rankings/words"],
    enabled: activeTab === "rankings",
  });

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
    enabled: activeTab === "news",
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements"],
    enabled: activeTab === "announcements",
  });

  const { data: activitiesToDo, isLoading: activitiesToDoLoading } = useQuery({
    queryKey: ["/api/activities-to-do"],
    enabled: activeTab === "activities",
  });

  // Activity form
  const activityForm = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      date: "",
      words: 0,
      type: "narrativa",
      responses: 0,
      link: "",
      description: "",
      arista: "ecos_del_corazon",
      album: "",
    },
  });

  // Mutations
  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      const res = await apiRequest("POST", "/api/activities", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rankings/trazos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rankings/words"] });
      activityForm.reset();
      setCalculatedTrazos(null);
      toast({
        title: "Actividad creada",
        description: "Tu actividad ha sido registrada exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateTrazosMutation = useMutation({
    mutationFn: async (data: { type: string; words: number; responses?: number }) => {
      const res = await apiRequest("POST", "/api/calculate-trazos", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setCalculatedTrazos(data.trazos);
    },
  });

  // Calculate trazos when form values change
  const watchedValues = activityForm.watch(["type", "words", "responses"]);
  
  const handleCalculateTrazos = () => {
    const [type, words, responses] = watchedValues;
    if (type && words > 0) {
      calculateTrazosMutation.mutate({ type, words, responses: responses || 0 });
    }
  };

  const onCreateActivity = (data: ActivityFormData) => {
    createActivityMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRankMedal = (rank: string) => {
    return RANK_MEDALS[rank as keyof typeof RANK_MEDALS];
  };

  const formatRankDisplay = (rank: string) => {
    const rankMap: Record<string, string> = {
      alma_en_transito: "Alma en tránsito",
      voz_en_boceto: "Voz en boceto",
      narrador_de_atmosferas: "Narrador de atmósferas",
      escritor_de_introspecciones: "Escritor de introspecciones",
      arquitecto_del_alma: "Arquitecto del alma",
    };
    return rankMap[rank] || rank;
  };

  const getUserRankPosition = (ranking: UserType[], userId: number) => {
    return ranking.findIndex(u => u.id === userId) + 1;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-lavender">𝐈𝐧𝐭𝐫𝐨𝐬𝐩𝐞𝐧𝐬</h2>
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("profile")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "profile" ? "text-lavender" : ""}`}
              >
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("news")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "news" ? "text-lavender" : ""}`}
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Noticias
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("announcements")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "announcements" ? "text-lavender" : ""}`}
              >
                <Bell className="mr-2 h-4 w-4" />
                Avisos
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("activities")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "activities" ? "text-lavender" : ""}`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Actividades
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("upload")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "upload" ? "text-lavender" : ""}`}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("rankings")}
                className={`text-gray-300 hover:text-lavender transition-colors ${activeTab === "rankings" ? "text-lavender" : ""}`}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Rankings
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Profile Section */}
        {activeTab === "profile" && (
          <div className="grid lg:grid-cols-3 gap-8 fade-in">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-gray-700">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-lavender to-pale-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="text-2xl text-black h-8 w-8" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white">{user.fullName}</h3>
                    <p className="text-lavender">{user.signature}</p>
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {user.birthday}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {user.age} años
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Trazos Totales</span>
                      <span className="text-pale-gold font-bold">{user.totalTrazos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Palabras Totales</span>
                      <span className="text-lavender font-bold">{user.totalWords}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Actividades</span>
                      <span className="text-white font-bold">{user.totalActivities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Miembro desde</span>
                      <span className="text-gray-400 text-sm">
                        {format(new Date(user.registrationDate), "MMM yyyy")}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rank Badge */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-pale-gold/20 to-lavender/20 rounded-lg text-center">
                    <h4 className="font-serif text-lg font-bold text-pale-gold">
                      {formatRankDisplay(user.rank)}
                    </h4>
                    {getRankMedal(user.rank) && (
                      <p className="text-sm text-gray-300 mt-1 flex items-center justify-center">
                        <Medal className="mr-1 h-4 w-4" />
                        "{getRankMedal(user.rank)}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl font-bold text-white">
                      Actividades Recientes
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                    </div>
                  ) : userActivities && userActivities.length > 0 ? (
                    <div className="space-y-4">
                      {userActivities.slice(0, 3).map((activity: any) => (
                        <div 
                          key={activity.id}
                          className="border border-gray-700 rounded-lg p-4 hover:border-lavender/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{activity.name}</h4>
                              <p className="text-sm text-gray-400 mt-1">
                                {activity.type} • {activity.words} palabras • {activity.trazos} trazos
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {activity.arista.replace(/_/g, ' ').toUpperCase()} → {activity.album}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(activity.date), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Aún no has subido ninguna actividad
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Upload Activity Section */}
        {activeTab === "upload" && (
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center text-white">
              Sube tu Actividad
            </h2>
            
            <Card className="glass-effect border-gray-700">
              <CardContent className="p-8">
                <form onSubmit={activityForm.handleSubmit(onCreateActivity)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Nombre de la Actividad</Label>
                      <Input
                        {...activityForm.register("name")}
                        className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                        placeholder="Título de tu obra"
                      />
                      {activityForm.formState.errors.name && (
                        <p className="text-red-400 text-sm mt-1">
                          {activityForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-white">Fecha</Label>
                      <Input
                        {...activityForm.register("date")}
                        type="date"
                        className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                      />
                      {activityForm.formState.errors.date && (
                        <p className="text-red-400 text-sm mt-1">
                          {activityForm.formState.errors.date.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-white">Palabras</Label>
                      <Input
                        {...activityForm.register("words", { valueAsNumber: true })}
                        type="number"
                        className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                        placeholder="750"
                        onChange={(e) => {
                          activityForm.setValue("words", parseInt(e.target.value));
                          handleCalculateTrazos();
                        }}
                      />
                      {activityForm.formState.errors.words && (
                        <p className="text-red-400 text-sm mt-1">
                          {activityForm.formState.errors.words.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-white">Tipo</Label>
                      <Select 
                        value={activityForm.watch("type")}
                        onValueChange={(value) => {
                          activityForm.setValue("type", value as any);
                          handleCalculateTrazos();
                        }}
                      >
                        <SelectTrigger className="bg-black/50 border-gray-600 focus:border-lavender text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrativa">Narrativa</SelectItem>
                          <SelectItem value="microcuento">Microcuento</SelectItem>
                          <SelectItem value="drabble">Drabble</SelectItem>
                          <SelectItem value="hilo">Hilo</SelectItem>
                          <SelectItem value="rol">Rol</SelectItem>
                          <SelectItem value="encuesta">Encuesta</SelectItem>
                          <SelectItem value="collage">Collage</SelectItem>
                          <SelectItem value="poemas">Poemas</SelectItem>
                          <SelectItem value="pinturas">Pinturas</SelectItem>
                          <SelectItem value="interpretacion">Interpretación</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Respuestas</Label>
                      <Input
                        {...activityForm.register("responses", { valueAsNumber: true })}
                        type="number"
                        className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                        placeholder="0"
                        onChange={(e) => {
                          activityForm.setValue("responses", parseInt(e.target.value) || 0);
                          handleCalculateTrazos();
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Arista</Label>
                      <Select 
                        value={activityForm.watch("arista")}
                        onValueChange={(value) => activityForm.setValue("arista", value as any)}
                      >
                        <SelectTrigger className="bg-black/50 border-gray-600 focus:border-lavender text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inventario_de_la_vida">I. INVENTARIO DE LA VIDA</SelectItem>
                          <SelectItem value="mapa_del_inconsciente">II. MAPA DEL INCONSCIENTE</SelectItem>
                          <SelectItem value="ecos_del_corazon">III. ECOS DEL CORAZÓN</SelectItem>
                          <SelectItem value="reflejos_en_el_tiempo">IV. REFLEJOS EN EL TIEMPO</SelectItem>
                          <SelectItem value="galeria_del_alma">V. GALERÍA DEL ALMA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Álbum</Label>
                      <Input
                        {...activityForm.register("album")}
                        className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                        placeholder="Nombre del álbum"
                      />
                      {activityForm.formState.errors.album && (
                        <p className="text-red-400 text-sm mt-1">
                          {activityForm.formState.errors.album.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Link</Label>
                    <Input
                      {...activityForm.register("link")}
                      type="url"
                      className="bg-black/50 border-gray-600 focus:border-lavender text-white"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Descripción Breve</Label>
                    <Textarea
                      {...activityForm.register("description")}
                      rows={3}
                      className="bg-black/50 border-gray-600 focus:border-lavender resize-none text-white"
                      placeholder="Describe tu actividad..."
                    />
                  </div>
                  
                  {/* Auto-calculated Trazos Display */}
                  {calculatedTrazos !== null && (
                    <div className="bg-pale-gold/10 border border-pale-gold/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Trazos Calculados:</span>
                        <span className="text-pale-gold font-bold text-lg">{calculatedTrazos}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Basado en tipo: {activityForm.watch("type")} ({activityForm.watch("words")} palabras)
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full glass-effect hover-glow px-8 py-4 text-lg font-medium transition-all duration-300 glow-effect border-2 border-lavender text-lavender hover:bg-lavender hover:text-black bg-transparent"
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? (
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="mr-3 h-5 w-5" />
                    )}
                    Subir Actividad
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rankings Section */}
        {activeTab === "rankings" && (
          <div className="max-w-6xl mx-auto fade-in">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center text-white">
              Rankings Globales
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Trazos Ranking */}
              <Card className="glass-effect border-gray-700">
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-bold text-pale-gold flex items-center">
                    <PenTool className="mr-3 h-5 w-5" />
                    Ranking de Trazos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trazosLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                    </div>
                  ) : trazosRanking && trazosRanking.length > 0 ? (
                    <div className="space-y-3">
                      {trazosRanking.map((rankUser: UserType, index: number) => (
                        <div 
                          key={rankUser.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            rankUser.id === user.id 
                              ? 'bg-lavender/20 border-lavender/30' 
                              : index === 0 
                                ? 'bg-pale-gold/20 border-pale-gold/30'
                                : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-pale-gold text-black' :
                              index === 1 ? 'bg-lavender text-black' :
                              index === 2 ? 'bg-gray-600 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {index === 0 && <Crown className="h-4 w-4" />}
                              {index !== 0 && (index + 1)}
                            </span>
                            <div>
                              <p className="font-medium text-white">{rankUser.fullName}</p>
                              <p className="text-xs text-gray-400">{rankUser.signature}</p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            index === 0 ? 'text-pale-gold' :
                            index === 1 ? 'text-lavender' :
                            'text-gray-300'
                          }`}>
                            {rankUser.totalTrazos}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No hay datos disponibles</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Words Ranking */}
              <Card className="glass-effect border-gray-700">
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-bold text-lavender flex items-center">
                    <BookOpen className="mr-3 h-5 w-5" />
                    Ranking de Palabras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wordsLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                    </div>
                  ) : wordsRanking && wordsRanking.length > 0 ? (
                    <div className="space-y-3">
                      {wordsRanking.map((rankUser: UserType, index: number) => (
                        <div 
                          key={rankUser.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            rankUser.id === user.id 
                              ? 'bg-lavender/20 border-lavender/30' 
                              : index === 0 
                                ? 'bg-pale-gold/20 border-pale-gold/30'
                                : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-pale-gold text-black' :
                              index === 1 ? 'bg-lavender text-black' :
                              index === 2 ? 'bg-gray-600 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {index === 0 && <Crown className="h-4 w-4" />}
                              {index !== 0 && (index + 1)}
                            </span>
                            <div>
                              <p className="font-medium text-white">{rankUser.fullName}</p>
                              <p className="text-xs text-gray-400">{rankUser.signature}</p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            index === 0 ? 'text-pale-gold' :
                            index === 1 ? 'text-lavender' :
                            'text-gray-300'
                          }`}>
                            {rankUser.totalWords.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No hay datos disponibles</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* News Section */}
        {activeTab === "news" && (
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center text-white">
              Noticias
            </h2>
            
            {newsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lavender" />
              </div>
            ) : news && news.length > 0 ? (
              <div className="space-y-6">
                {news.map((item: any) => (
                  <Card key={item.id} className="glass-effect border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-white mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Publicado por Admin • {format(new Date(item.createdAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-lavender/20 text-lavender">
                          Nuevo
                        </Badge>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-effect border-gray-700">
                <CardContent className="p-8">
                  <p className="text-gray-400 text-center">No hay noticias disponibles</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Announcements Section */}
        {activeTab === "announcements" && (
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center text-white">
              Avisos
            </h2>
            
            {announcementsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lavender" />
              </div>
            ) : announcements && announcements.length > 0 ? (
              <div className="space-y-6">
                {announcements.map((item: any) => (
                  <Card key={item.id} className="glass-effect border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-white mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Publicado por Admin • {format(new Date(item.createdAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-effect border-gray-700">
                <CardContent className="p-8">
                  <p className="text-gray-400 text-center">No hay avisos disponibles</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Activities To Do Section */}
        {activeTab === "activities" && (
          <div className="max-w-6xl mx-auto fade-in">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center text-white">
              Actividades por Realizar
            </h2>
            
            {activitiesToDoLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lavender" />
              </div>
            ) : activitiesToDo && activitiesToDo.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Group by arista */}
                {Array.from(new Set(activitiesToDo.map((item: any) => item.arista))).map((arista: any) => (
                  <Card key={arista} className="glass-effect border-gray-700">
                    <CardHeader>
                      <CardTitle className="font-serif text-lg font-bold text-pale-gold">
                        {arista.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activitiesToDo
                          .filter((item: any) => item.arista === arista)
                          .map((item: any) => (
                            <div key={item.id} className="border-l-4 border-lavender pl-4 py-2">
                              <h4 className="font-medium text-white">{item.title}</h4>
                              <p className="text-sm text-gray-400">⟡ {item.album}</p>
                              {item.dueDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Vence: {format(new Date(item.dueDate), "dd MMM")}
                                </p>
                              )}
                              <p className="text-sm text-gray-300 mt-2">{item.description}</p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-effect border-gray-700">
                <CardContent className="p-8">
                  <p className="text-gray-400 text-center">No hay actividades programadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
