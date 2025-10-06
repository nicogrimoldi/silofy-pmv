import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Bell, CloudSun, Database, Download, Filter, RefreshCw, ShieldAlert, ShieldCheck, Thermometer, Droplets, Wind, MapPin, MessageSquare, Phone, LineChart as LineIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";

/**
 * Plataforma Silofy – PMV con identidad de marca
 * Paleta y estilo inspirados en la web: Verde Silofy #3FAE49, Gris #2F2F2F, acentos suaves.
 * Mantiene TODAS las funciones del dashboard original y suma: clima y precios de mercado (mock), canales de alerta y branding.
 */

// —— Datos mock (demo) ——
const mockBags = [
  { id: "SB-001", farm: "La Esperanza", crop: "Maíz", tons: 210, lat: -43.45, lng: -65.04, temp: 28.4, hum: 14.2, co2: 0.7, risk: 0.27, status: "OK" },
  { id: "SB-002", farm: "La Esperanza", crop: "Maíz", tons: 190, lat: -43.46, lng: -65.02, temp: 31.1, hum: 16.9, co2: 1.9, risk: 0.62, status: "Atención" },
  { id: "SB-003", farm: "Los Álamos", crop: "Soja", tons: 230, lat: -43.43, lng: -65.09, temp: 26.6, hum: 13.8, co2: 0.5, risk: 0.18, status: "OK" },
  { id: "SB-004", farm: "Los Álamos", crop: "Soja", tons: 180, lat: -43.41, lng: -65.01, temp: 33.2, hum: 18.3, co2: 2.8, risk: 0.81, status: "Alto" },
  { id: "SB-005", farm: "El Trébol", crop: "Trigo", tons: 150, lat: -43.47, lng: -65.06, temp: 29.5, hum: 15.5, co2: 1.1, risk: 0.39, status: "Atención" },
];

const timeSeries = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  temp: 25 + Math.sin(i / 2) * 4 + (i > 8 ? 2 : 0),
  hum: 13 + Math.cos(i / 3) * 3 + (i > 8 ? 2.5 : 0),
  co2: 0.6 + Math.max(0, (i - 8) * 0.18),
}));
console.log("[Silofy] timeSeries ready:", timeSeries.length, "points");

const market = [
  { name: "Soja", price: 374, change: +1.2 },
  { name: "Maíz", price: 192, change: -0.4 },
  { name: "Trigo", price: 214, change: +0.7 },
];

const forecast = [
  { d: "Hoy", t: 27, h: 48, wind: 18 },
  { d: "+1", t: 29, h: 44, wind: 22 },
  { d: "+2", t: 31, h: 40, wind: 25 },
];

// —— Utilidades ——
function RiskBadge({ risk }: { risk: number }) {
  let label = "Bajo"; let style = "secondary";
  if (risk >= 0.75) { label = "Alto"; style = "destructive"; }
  else if (risk >= 0.4) { label = "Medio"; style = "default"; }
  return <Badge variant={style}>{label}</Badge>;
}
function k(n: number) { return n.toLocaleString("es-AR"); }

export default function SilofyDashboard() {
  console.log("[Silofy] Render start");

  // Filtros y toggles
  const [campaign, setCampaign] = useState("2025");
  const [crop, setCrop] = useState<string | "Todas">("Todas");
  const [farm, setFarm] = useState<string | "Todas">("Todas");
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [chWhatsApp, setChWhatsApp] = useState(true);
  const [chSMS, setChSMS] = useState(false);
  const [chEmail, setChEmail] = useState(true);

  useEffect(() => {
    console.log("[Silofy] Mounted");
    return () => console.log("[Silofy] Unmounted");
  }, []);

  console.log("[Silofy] State init:", { campaign, crop, farm, liveAlerts, chWhatsApp, chSMS, chEmail });

  const farms = useMemo(() => {
    const f = Array.from(new Set(mockBags.map(b => b.farm)));
    console.log("[Silofy] farms computed:", f);
    return f;
  }, []);
  const crops = useMemo(() => {
    const c = Array.from(new Set(mockBags.map(b => b.crop)));
    console.log("[Silofy] crops computed:", c);
    return c;
  }, []);

  const filtered = mockBags.filter(b => (crop === "Todas" || b.crop === crop) && (farm === "Todas" || b.farm === farm));
  console.log("[Silofy] Filters applied:", { campaign, crop, farm, filteredIds: filtered.map(b=>b.id) });

  const kpis = useMemo(() => {
    const totalBags = filtered.length;
    const totalTons = filtered.reduce((s, b) => s + b.tons, 0);
    const atRiskTons = filtered.filter(b => b.risk >= 0.4).reduce((s, b) => s + b.tons, 0);
    const avgTemp = filtered.reduce((s, b) => s + b.temp, 0) / Math.max(1, filtered.length);
    const avgHum = filtered.reduce((s, b) => s + b.hum, 0) / Math.max(1, filtered.length);
    const alertsOpen = filtered.filter(b => b.status !== "OK").length;
    const out = { totalBags, totalTons, atRiskTons, avgTemp, avgHum, alertsOpen };
    console.log("[Silofy] KPIs recomputed:", out);
    return out;
  }, [filtered]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E9F7EF] to-white text-[#2F2F2F]">
      {/* Header con branding */}
      <div className="px-6 pt-8 pb-4 bg-white/70 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3FAE49] tracking-tight flex items-center gap-3">
              <LineIcon className="h-8 w-8"/> Silofy · Plataforma Poscosecha
            </h1>
            <p className="text-sm text-[#2F2F2F]/70">IA predictiva · Conectividad LoRa + Satélite · Prevención real · Sustentabilidad</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => console.log("[Silofy] Export PDF clicked", { campaign, crop, farm, items: filtered.length })}><Download className="h-4 w-4"/> Exportar PDF</Button>
            <Button className="gap-2 bg-[#3FAE49] hover:bg-[#349842] text-white" onClick={() => console.log("[Silofy] Refresh clicked") }><RefreshCw className="h-4 w-4"/> Actualizar</Button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <Card className="mb-6 border-[#3FAE49]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Campaña, cultivo y establecimiento</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">Campaña</label>
              <Select value={campaign} onValueChange={(v) => { console.log("[Silofy] Campaign change:", v); setCampaign(v); }}>
                <SelectTrigger className="border-[#3FAE49]/30"><SelectValue placeholder="Campaña" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Cultivo</label>
              <Select value={crop} onValueChange={(v)=>{ console.log("[Silofy] Crop change:", v); setCrop(v as any); }}>
                <SelectTrigger className="border-[#3FAE49]/30"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todos</SelectItem>
                  {crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Establecimiento</label>
              <Select value={farm} onValueChange={(v)=>{ console.log("[Silofy] Farm change:", v); setFarm(v as any); }}>
                <SelectTrigger className="border-[#3FAE49]/30"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todos</SelectItem>
                  {farms.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="gap-2 w-full" onClick={() => console.log("[Silofy] Apply filters clicked", { campaign, crop, farm })}><Filter className="h-4 w-4"/> Aplicar</Button>
            </div>
            <div className="flex items-end gap-4 md:col-span-2">
              <div className="text-xs text-slate-500 flex items-center gap-2"><MessageSquare className="h-3 w-3"/> WhatsApp <Switch checked={chWhatsApp} onCheckedChange={(v)=>{ console.log("[Silofy] WhatsApp alerts toggled:", v); setChWhatsApp(v); }}/></div>
              <div className="text-xs text-slate-500 flex items-center gap-2"><Phone className="h-3 w-3"/> SMS <Switch checked={chSMS} onCheckedChange={(v)=>{ console.log("[Silofy] SMS alerts toggled:", v); setChSMS(v); }}/></div>
              <div className="text-xs text-slate-500 flex items-center gap-2"><Bell className="h-3 w-3"/> Email <Switch checked={chEmail} onCheckedChange={(v)=>{ console.log("[Silofy] Email alerts toggled:", v); setChEmail(v); }}/></div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="md:col-span-1 border-l-4 border-[#3FAE49]"><CardHeader className="pb-2"><CardDescription>Total de silobolsas</CardDescription><CardTitle className="text-3xl">{kpis.totalBags}</CardTitle></CardHeader><CardContent className="pt-0"><Badge variant="secondary" className="gap-1"><Database className="h-3 w-3"/> Inventario</Badge></CardContent></Card>
          <Card className="md:col-span-1 border-l-4 border-[#3FAE49]"><CardHeader className="pb-2"><CardDescription>Tn almacenadas</CardDescription><CardTitle className="text-3xl">{k(kpis.totalTons)}</CardTitle></CardHeader><CardContent className="pt-0"><Progress value={(kpis.totalTons/1000)*10} /></CardContent></Card>
          <Card className="md:col-span-1 border-l-4 border-[#3FAE49]"><CardHeader className="pb-2"><CardDescription>Tn en riesgo</CardDescription><CardTitle className="text-3xl">{k(kpis.atRiskTons)}</CardTitle></CardHeader><CardContent className="pt-0"><RiskBadge risk={kpis.atRiskTons / Math.max(1,kpis.totalTons)} /></CardContent></Card>
          <Card className="md:col-span-1 border-l-4 border-[#3FAE49]"><CardHeader className="pb-2"><CardDescription>Temp. promedio (°C)</CardDescription><CardTitle className="text-3xl">{kpis.avgTemp.toFixed(1)}</CardTitle></CardHeader><CardContent className="pt-0 flex items-center gap-2 text-slate-500"><Thermometer className="h-4 w-4"/> Objetivo 18–27°C</CardContent></Card>
          <Card className="md:col-span-1 border-l-4 border-[#3FAE49]"><CardHeader className="pb-2"><CardDescription>Humedad promedio (%)</CardDescription><CardTitle className="text-3xl">{kpis.avgHum.toFixed(1)}</CardTitle></CardHeader><CardContent className="pt-0 flex items-center gap-2 text-slate-500"><Droplets className="h-4 w-4"/> Límite {"<"}16% (ref.)</CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="grid grid-cols-5 bg[#3FAE49]/10 rounded-xl">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="inteligencia">Clima & Mercado</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle>Evolución (14 días)</CardTitle><CardDescription>Temp, Humedad y CO₂ promedio ponderado</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="temp" name="Temp (°C)" fill="#3FAE49" stroke="#3FAE49" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="hum" name="Humedad (%)" fill="#2F2F2F" stroke="#2F2F2F" fillOpacity={0.15} />
                      <Line type="monotone" dataKey="co2" name="CO₂ (%)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle>Riesgo por silobolsa</CardTitle><CardDescription>Score 0–1</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" />
                      <YAxis domain={[0,1]} />
                      <Tooltip />
                      <Bar dataKey="risk" name="Riesgo" fill="#3FAE49" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle>Mapa (referencial)</CardTitle><CardDescription>Ubicación de silobolsas</CardDescription></CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 grid grid-cols-6 grid-rows-4 p-2">
                    {filtered.map((b) => (
                      <div key={b.id} className={`col-span-1 row-span-1 m-1 rounded-xl bg-white shadow flex items-center justify-center text-xs font-medium border ${b.status!=="OK"?"border-[#3FAE49]":"border-slate-200"}`}>
                        <span title={`${b.id} · ${b.farm}`}>{b.id}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500"><MapPin className="h-3 w-3"/> Próxima iteración: mapa real (Leaflet/Mapbox) con capas de clima.</div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Alertas activas</CardTitle>
                    <CardDescription>Operación y calidad</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-sm"><Bell className="h-4 w-4"/>
                    <span>Tiempo real</span>
                    <Switch checked={liveAlerts} onCheckedChange={(v)=>{ console.log("[Silofy] Live alerts toggled:", v); setLiveAlerts(v); }}/>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Silobolsa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Detalle</TableHead>
                        <TableHead>Severidad</TableHead>
                        <TableHead>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.filter(b => b.status !== "OK").map(b => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.id}</TableCell>
                          <TableCell>{b.co2 > 2 ? "Calidad (CO₂)" : "Operativa"}</TableCell>
                          <TableCell>{b.co2 > 2 ? `CO₂ elevado (${b.co2.toFixed(1)}%)` : `T ${b.temp.toFixed(1)}°C / H ${b.hum.toFixed(1)}%`}</TableCell>
                          <TableCell><RiskBadge risk={b.risk}/></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={()=>console.log("[Silofy] Ver alerta", b.id)}>Ver</Button>
                              <Button size="sm" className="bg-[#3FAE49] hover:bg-[#349842] text-white" onClick={()=>console.log("[Silofy] Reconocer alerta", b.id)}>Reconocer</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.filter(b => b.status !== "OK").length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-slate-500">Sin alertas activas</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tendencias" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle>Tendencia de Temperatura</CardTitle><CardDescription>14 días</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#3FAE49" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle>Tendencia de Humedad</CardTitle><CardDescription>14 días</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hum" name="Humedad (%)" stroke="#2F2F2F" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle>Tendencia de CO₂</CardTitle><CardDescription>Indicador de fermentación</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="co2" name="CO₂ (%)" stroke="#ef4444" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventario" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <div>
                  <CardTitle>Inventario por silobolsa</CardTitle>
                  <CardDescription>Estado, toneladas y condiciones</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Buscar SB-00X…" className="w-44" />
                  <Button variant="outline" onClick={()=>console.log("[Silofy] Descargar CSV", { rows: filtered.length })}>Descargar CSV</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Silobolsa</TableHead>
                      <TableHead>Establecimiento</TableHead>
                      <TableHead>Cultivo</TableHead>
                      <TableHead>Tn</TableHead>
                      <TableHead>Temp (°C)</TableHead>
                      <TableHead>Hum (%)</TableHead>
                      <TableHead>CO₂ (%)</TableHead>
                      <TableHead>Riesgo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.id}</TableCell>
                        <TableCell>{b.farm}</TableCell>
                        <TableCell>{b.crop}</TableCell>
                        <TableCell>{k(b.tons)}</TableCell>
                        <TableCell>{b.temp.toFixed(1)}</TableCell>
                        <TableCell>{b.hum.toFixed(1)}</TableCell>
                        <TableCell>{b.co2.toFixed(1)}</TableCell>
                        <TableCell><RiskBadge risk={b.risk}/></TableCell>
                        <TableCell>{b.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle>Resumen de causas</CardTitle><CardDescription>Clasificación de las últimas alertas</CardDescription></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name:"CO₂", v:3},{name:"T°", v:5},{name:"Humedad", v:2},{name:"Vandalismo", v:1}]}> 
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="v" name="Cantidad" fill="#3FAE49" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle>Recomendaciones del sistema</CardTitle><CardDescription>Acciones sugeridas según señales</CardDescription></CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2"><Thermometer className="h-4 w-4 text-[#3FAE49] mt-0.5"/> Abrir SB-002 en horas de menor temperatura para ventilar; volver a cerrar y monitorear 24 h.</li>
                    <li className="flex items-start gap-2"><Droplets className="h-4 w-4 text-[#3FAE49] mt-0.5"/> Verificar humedad de grano en SB-004; considerar traslado si se mantiene {">"}16% por 48 h.</li>
                    <li className="flex items-start gap-2"><Wind className="h-4 w-4 text-[#3FAE49] mt-0.5"/> Revisar sellado en cabezales ante ráfagas previstas; agregar protección física.</li>
                  </ul>
                  <div className="mt-4 text-xs text-slate-500">* Motor de reglas (demo). Próxima iteración: modelo predictivo de deterioro y priorización por costo esperado.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inteligencia" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle>Precios de mercado (demo)</CardTitle><CardDescription>Valores de referencia en vivo</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio (USD/t)</TableHead>
                        <TableHead>Variación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {market.map(m => (
                        <TableRow key={m.name}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>{m.price}</TableCell>
                          <TableCell className={m.change>=0?"text-green-600":"text-red-600"}>{m.change>=0?`+${m.change}`:m.change}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-xs text-slate-500 mt-2">* Datos simulados para demo. Se integrarán fuentes en tiempo real.</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle>Clima (3 días)</CardTitle><CardDescription>Pronóstico local (demo)</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {forecast.map(f => (
                    <div key={f.d} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2"><CloudSun className="h-4 w-4 text-[#3FAE49]"/> <span className="text-sm font-medium">{f.d}</span></div>
                      <div className="text-xs text-slate-600 flex items-center gap-4">
                        <span><Thermometer className="inline h-3 w-3 mr-1"/>{f.t}°C</span>
                        <span><Droplets className="inline h-3 w-3 mr-1"/>{f.h}%</span>
                        <span><Wind className="inline h-3 w-3 mr-1"/>{f.wind} km/h</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500">* Integración futura: estación meteo + API externa, como figura en la web.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />
        <div className="text-xs text-[#2F2F2F]/70 flex flex-wrap items-center gap-3">
          <ShieldAlert className="h-3 w-3"/> Prototipo PMV con datos simulados para validación. Próximos pasos: sensores reales, mapas, precios y clima en vivo; exportación a aseguradoras/traders.
        </div>
      </div>

      <footer className="text-center text-xs text-[#2F2F2F]/70 mt-6 border-t pt-4">
        © 2025 Silofy · Innovación y sustentabilidad agrícola · LoRa + Satélite · IA Predictiva
      </footer>
    </div>
  );
}
