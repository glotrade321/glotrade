"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Facebook,
    Instagram,
    Music2,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    CreditCard,
    Truck,
    RotateCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";

const socialLinks = {
    facebook: "https://www.facebook.com/share/18cWJ3yrjz/?mibextid=wwXIfr",
    x: "https://x.com/glotradeproduct?s=21",
    instagram: "https://www.instagram.com/glotrade_platform?igsh=cXJ6c2t6cGU2NzFq",
    youtube: "https://www.youtube.com/@GLOTRADE.online/videos",
    tiktok: "https://www.tiktok.com/@glotradeproducts?_r=1&_t=ZS-95hYR9R3X1N",
};

export default function Footer() {
    const [locale, setLocale] = useState<Locale>("en");

    useEffect(() => {
        setLocale(getStoredLocale());
        const onLocale = (e: Event) => {
            const detail = (e as CustomEvent).detail as { locale: Locale };
            setLocale(detail.locale);
        };
        window.addEventListener("i18n:locale", onLocale as EventListener);
        return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 border-t border-neutral-800 text-neutral-300 pt-12 pb-6 mt-12 w-full">
            <div className="mx-auto w-[95%] px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-12 h-12 shrink-0">
                                <Image
                                    src="/glotrade_logo.png"
                                    alt="GloTrade Logo"
                                    fill
                                    className="object-contain brightness-0 invert"
                                    sizes="48px"
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-wide text-white">
                                Glotrade
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-neutral-400">
                            {translate(locale, "footer.desc")}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Glotrade on Facebook" className="p-2 bg-white/5 rounded-full hover:bg-[#2EA5FF] hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" aria-label="Glotrade on X" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/5 text-sm font-bold hover:bg-[#2EA5FF] hover:text-white transition-all duration-300">
                                X
                            </a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Glotrade on Instagram" className="p-2 bg-white/5 rounded-full hover:bg-[#2EA5FF] hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="Glotrade on YouTube" className="p-2 bg-white/5 rounded-full hover:bg-[#2EA5FF] hover:text-white transition-all duration-300">
                                <Youtube size={18} />
                            </a>
                            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="Glotrade on TikTok" className="p-2 bg-white/5 rounded-full hover:bg-[#2EA5FF] hover:text-white transition-all duration-300">
                                <Music2 size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">{translate(locale, "footer.shop")}</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/marketplace" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    {translate(locale, "footer.marketplace")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/best-selling" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    {translate(locale, "footer.bestSellers")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/marketplace?sort=-createdAt" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    {translate(locale, "footer.newArrivals")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    {translate(locale, "footer.about") || "About Us"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/gdip" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-[#F9A407]" />
                                    {translate(locale, "footer.gdip")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">{translate(locale, "footer.support")}</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/support" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.helpCenter")}</Link>
                            </li>
                            <li>
                                <Link href="/orders" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.trackOrder")}</Link>
                            </li>
                            <li>
                                <Link href="/shipping-policy" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.shipping")}</Link>
                            </li>
                            <li>
                                <Link href="/support#contact" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.contact")}</Link>
                            </li>
                        </ul>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3 text-xs text-neutral-400">
                                <MapPin size={16} className="text-[#2EA5FF] shrink-0" />
                                <span>Lagos & Abuja, Nigeria</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-neutral-400">
                                <Phone size={16} className="text-[#2EA5FF] shrink-0" />
                                <div className="space-y-1">
                                    <a href="tel:+2349029004712" className="block hover:text-[#2EA5FF] transition-colors">
                                        Lagos: (+234)902-900-4712
                                    </a>
                                    <a href="tel:+2347024600924" className="block hover:text-[#2EA5FF] transition-colors">
                                        Abuja: (+234)704-460-0924
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <Mail size={16} className="text-[#2EA5FF] shrink-0" />
                                <span>support@glotrade.online</span>
                            </div>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">{translate(locale, "footer.legal")}</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/privacy-policy" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.privacy")}</Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.terms")}</Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    <RotateCcw size={14} className="text-orange-400" />
                                    {translate(locale, "footer.refundPolicy") || "Refund Policy"}
                                </Link>
                            </li>
                            <li>
                                <Link href="/security/fraud-cases" className="hover:text-[#2EA5FF] transition-colors">{translate(locale, "footer.fraud")}</Link>
                            </li>
                            <li>
                                <Link href="/security/report" className="hover:text-[#2EA5FF] transition-colors flex items-center gap-2">
                                    <ShieldCheck size={14} />
                                    {translate(locale, "footer.security")}
                                </Link>
                            </li>
                        </ul>
                        <div className="bg-neutral-800/50 p-4 rounded-xl space-y-3 border border-neutral-700/50">
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <CreditCard size={16} className="text-green-500" />
                                <span>{translate(locale, "footer.securePayments")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <RotateCcw size={16} className="text-orange-500" />
                                <span>{translate(locale, "footer.returns")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <Truck size={16} className="text-blue-500" />
                                <span>{translate(locale, "footer.delivery")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs text-neutral-500 text-center md:text-left">
                        <p>&copy; {currentYear} Glotrade. {translate(locale, "footer.rights")} v1.0.1</p>
                        <p className="mt-1">{translate(locale, "footer.developer")}: NEXGEN TECH INNOVATIONS LIMITED</p>
                        <p className="mt-1">{translate(locale, "footer.tagline")}</p>
                    </div>

                    <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* Payment Icons Placeholder */}
                        <div className="flex items-center gap-4">
                            {/* These would be actual SVGs/images for Paystack, Flutterwave, Mastercard, Visa etc */}
                            {/* <div className="h-6 w-10 bg-neutral-700 rounded-md" title="Visa"></div>
                            <div className="h-6 w-10 bg-neutral-700 rounded-md" title="Mastercard"></div>
                            <div className="h-6 w-10 bg-neutral-700 rounded-md" title="Paystack"></div>
                            <div className="h-6 w-10 bg-neutral-700 rounded-md" title="Flutterwave"></div> */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <g className="nc-icon-wrapper">
                                    <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#1434cb" strokeWidth="0"></rect>
                                    <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" strokeWidth="0" opacity=".15"></path>
                                    <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                                    <path d="m13.392,12.624l-2.838,6.77h-1.851l-1.397-5.403c-.085-.332-.158-.454-.416-.595-.421-.229-1.117-.443-1.728-.576l.041-.196h2.98c.38,0,.721.253.808.69l.738,3.918,1.822-4.608h1.84Z" fill="#fff" strokeWidth="0"></path>
                                    <path d="m20.646,17.183c.008-1.787-2.47-1.886-2.453-2.684.005-.243.237-.501.743-.567.251-.032.943-.058,1.727.303l.307-1.436c-.421-.152-.964-.299-1.638-.299-1.732,0-2.95.92-2.959,2.238-.011.975.87,1.518,1.533,1.843.683.332.912.545.909.841-.005.454-.545.655-1.047.663-.881.014-1.392-.238-1.799-.428l-.318,1.484c.41.188,1.165.351,1.947.359,1.841,0,3.044-.909,3.05-2.317" fill="#fff" strokeWidth="0"></path>
                                    <path d="m25.423,12.624h-1.494c-.337,0-.62.195-.746.496l-2.628,6.274h1.839l.365-1.011h2.247l.212,1.011h1.62l-1.415-6.77Zm-2.16,4.372l.922-2.542.53,2.542h-1.452Z" fill="#fff" strokeWidth="0"></path>
                                    <path fill="#fff" strokeWidth="0" d="M15.894 12.624L14.446 19.394 12.695 19.394 14.143 12.624 15.894 12.624z"></path>
                                </g>
                            </svg><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <g className="nc-icon-wrapper">
                                    <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#141413" strokeWidth="0"></rect>
                                    <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" strokeWidth="0" opacity=".15"></path>
                                    <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                                    <path fill="#ff5f00" strokeWidth="0" d="M13.597 11.677H18.407V20.32H13.597z"></path>
                                    <path d="m13.902,15.999c0-1.68.779-3.283,2.092-4.322-2.382-1.878-5.849-1.466-7.727.932-1.863,2.382-1.451,5.833.947,7.712,2,1.573,4.795,1.573,6.795,0-1.329-1.038-2.107-2.642-2.107-4.322Z" fill="#eb001b" strokeWidth="0"></path>
                                    <path d="m24.897,15.999c0,3.039-2.459,5.497-5.497,5.497-1.237,0-2.428-.412-3.39-1.176,2.382-1.878,2.795-5.329.916-7.727-.275-.336-.58-.657-.916-.916,2.382-1.878,5.849-1.466,7.712.932.764.962,1.176,2.153,1.176,3.39Z" fill="#f79e1b" strokeWidth="0"></path>
                                </g>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <g className="nc-icon-wrapper">
                                    <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#1a1a1a" strokeWidth="0"></rect>
                                    <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" opacity=".15" strokeWidth="0"></path>
                                    <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                                    <rect x="5" y="11" width="6" height="5" rx="1.5" ry="1.5" fill="#edab40" strokeWidth="0"></rect>
                                    <path d="m9,20h-3.25c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h3.25c.4141,0,.75.3359.75.75s-.3359.75-.75.75Z" fill="#90928f" strokeWidth="0"></path>
                                    <path d="m14.75,20h-3.25c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h3.25c.4141,0,.75.3359.75.75s-.3359.75-.75.75Z" fill="#90928f" strokeWidth="0"></path>
                                    <path d="m20.5,20h-3.25c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h3.25c.4141,0,.75.3359.75.75s-.3359.75-.75.75Z" fill="#90928f" strokeWidth="0"></path>
                                    <path d="m26.25,20h-3.25c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h3.25c.4141,0,.75.3359.75.75s-.3359.75-.75.75Z" fill="#90928f" strokeWidth="0"></path>
                                </g>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <g className="nc-icon-wrapper">
                                    <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#e6e6e6" strokeWidth="0"></rect>
                                    <path fill="#fff" strokeWidth="0" d="M6 18H19V21H6z"></path>
                                    <path d="m24.5,13.5c1.519,0,2.902.569,3.96,1.5h1.54v-4H2v4h18.541c1.057-.931,2.44-1.5,3.959-1.5Z" fill="#1a1a1a" strokeWidth="0"></path>
                                    <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" strokeWidth="0" opacity=".15"></path>
                                    <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                                    <circle cx="24.5" cy="19.5" r="6" fill="#e6e6e6" strokeWidth="0"></circle>
                                    <path fill="#fff" strokeWidth="0" d="M19 17H29V22H19z"></path>
                                    <circle cx="24.5" cy="19.5" r="6" fill="none" stroke="#ed1c24" strokeMiterlimit="10"></circle>
                                    <circle cx="21.75" cy="19.5" r=".75" fill="#1a1a1a" strokeWidth="0"></circle>
                                    <circle cx="24.25" cy="19.5" r=".75" fill="#1a1a1a" strokeWidth="0"></circle>
                                    <circle cx="26.75" cy="19.5" r=".75" fill="#1a1a1a" strokeWidth="0"></circle>
                                </g>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <g className="nc-icon-wrapper">
                                    <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#e6e6e6" strokeWidth="0"></rect>
                                    <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" opacity=".15" strokeWidth="0"></path>
                                    <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                                    <path d="m21.5,21h-11c-.2764,0-.5.2236-.5.5s.2236.5.5.5h11c.2764,0,.5-.2236.5-.5s-.2236-.5-.5-.5Z" fill="#1a1a1a" opacity=".5" strokeWidth="0"></path>
                                    <path d="m21.6694,13.6787l-4.8486-3.2324c-.499-.332-1.1426-.332-1.6416,0l-4.8491,3.2324c-.2661.1777-.3823.5029-.2896.8096.0928.3062.3701.5117.6899.5117h1.0195v4h-.75c-.2764,0-.5.2236-.5.5s.2236.5.5.5h10c.2764,0,.5-.2236.5-.5s-.2236-.5-.5-.5h-.75v-4h1.0195c.3198,0,.5972-.2056.6899-.5117.0928-.3066-.0234-.6318-.29-.8096Zm-7.4194,5.3213h-1.5v-4h1.5v4Zm2.5,0h-1.5v-4h1.5v4Zm-.75-5.5c-.4142,0-.75-.3358-.75-.75s.3358-.75.75-.75.75.3358.75.75-.3358.75-.75.75Zm3.25,5.5h-1.5v-4h1.5v4Z" fill="#1a1a1a" opacity=".5" strokeWidth="0"></path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
