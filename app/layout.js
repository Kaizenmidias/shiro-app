import './globals.css';
import { Poppins } from 'next/font/google';
import { Providers } from '../components/Providers';
import { LayoutShell } from '../components/LayoutShell';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
});

export const metadata = {
    title: 'Shiro',
    description: 'No game, no life',
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR" className={poppins.variable}>
            <body className="scrollbar-none font-poppins">
                <Providers>
                    <LayoutShell>{children}</LayoutShell>
                </Providers>
            </body>
        </html>
    );
}
