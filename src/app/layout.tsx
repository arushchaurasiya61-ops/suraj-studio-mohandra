import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
export const metadata: Metadata = {title:{default:'Suraj Studio Mohandra',template:'%s | Suraj Studio Mohandra'},description:'Premium wedding photography, cinematic films and client galleries in Mohandra, Madhya Pradesh.',metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'),openGraph:{title:'Suraj Studio Mohandra',description:'Capturing Moments. Creating Memories.',type:'website'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/>{children}<WhatsAppButton/><footer className="footer"><div className="container"><div className="logo">SURAJ <b>STUDIO</b> MOHANDRA</div><p className="muted">Mohandra, Madhya Pradesh • 9752579532 • 9131590791</p><small className="muted">© 2026 Suraj Studio Mohandra. All Rights Reserved.</small></div></footer></body></html>}
