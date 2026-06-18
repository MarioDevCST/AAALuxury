export const supportedLanguages = ["es", "en"] as const;
export type Language = (typeof supportedLanguages)[number];

export const defaultLanguage: Language = "es";

type Messages = {
  header: {
    menu: string;
    closeMenu: string;
    openMenu: string;
    language: string;
    whatsapp: string;
    instagram: string;
  };
  search: {
    brand: string;
    allBrands: string;
    model: string;
    selectBrandFirst: string;
    vat: string;
    allVat: string;
    vatDeductible: string;
    vatNotDeductible: string;
    search: string;
  };
  hero: {
    title: string;
    description: string;
    ctaLatest: string;
  };
  features: { items: string[] };
  latest: {
    title: string;
    results: (count: number) => string;
    viewStock: string;
  };
  dream: { title: string; description: string };
  form: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    comments: string;
    notRobot: string;
    recaptcha: string;
    recaptchaPlaceholder: string;
    privacyAccept: string;
    privacyPolicy: string;
    marketingAccept: string;
    send: string;
    sentPlaceholder: string;
    dataProtection: string;
  };
  footer: {
    company: string;
    vehicles: string;
    about: string;
    showroom: string;
    findCar: string;
    latest: string;
    stock: string;
    vat: string;
    social: string;
  };
  cookies: {
    revisit: string;
    title: string;
    text: string;
    customize: string;
    reject: string;
    accept: string;
  };
  stock: { title: string; text: string; back: string };
  vehicle: {
    photoPlaceholder: string;
  };
};

export const messages: Record<Language, Messages> = {
  es: {
    header: {
      menu: "MENÚ",
      closeMenu: "Cerrar menú",
      openMenu: "Abrir menú",
      language: "Idioma",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    search: {
      brand: "Marca",
      allBrands: "Todas las marcas",
      model: "Modelo",
      selectBrandFirst: "Selecciona una marca",
      vat: "IVA",
      allVat: "Todos",
      vatDeductible: "IVA Deducible",
      vatNotDeductible: "IVA No Deducible",
      search: "BUSCAR",
    },
    hero: {
      title: "Stop dreaming... start driving!",
      description:
        "En ICONIC Motor Gallery tenemos el coche de tus sueños. Llevamos en el mundo de la compraventa de vehículos de alta gama desde el año 2001 y actualmente contamos con un stock de más de 140 coches.",
      ctaLatest: "ULTIMAS INCORPORACIONES",
    },
    features: {
      items: [
        "Más de 140 coches en Stock",
        "Pedidos A la carta",
        "Servicio personalizado",
        "Entrega domicilio en toda España",
        "Parking gratuito para clientes",
        "Re compramos tu coche",
      ],
    },
    latest: {
      title: "ÚLTIMAS INCORPORACIONES",
      results: (count) => `${count} RESULTADOS`,
      viewStock: "VER STOCK",
    },
    dream: {
      title: "TE ENCONTRAMOS EL COCHE DE TUS SUEÑOS",
      description:
        "Si estás buscando el coche de tus sueños, no busques más allá de Iconic Motor Gallery. Somos el concesionario de compra y venta de coches de lujo más importante de España que se dedica a encontrar el vehículo perfecto para ti. Sea cual sea tu sueño, ¡nosotros lo hacemos realidad!",
    },
    form: {
      name: "Nombre*",
      surname: "Apellidos*",
      email: "E-mail*",
      phone: "Teléfono*",
      comments: "Comentarios*",
      notRobot: "I'm not a robot",
      recaptcha: "reCAPTCHA",
      recaptchaPlaceholder: "Placeholder visual (sin integración).",
      privacyAccept: "Acepto la",
      privacyPolicy: "Política de Privacidad",
      marketingAccept:
        "Acepto recibir información comercial, incluso por correo electrónico.",
      send: "ENVIAR",
      sentPlaceholder: "Enviado (placeholder).",
      dataProtection:
        "INFORMACIÓN PROTECCIÓN DE DATOS. Finalidades: Responder a sus solicitudes y remitirle información comercial de nuestros productos y servicios. Destinatarios: No están previstas cesiones de datos. Derechos: Puede retirar su consentimiento en cualquier momento.",
    },
    footer: {
      company: "ICONIC MOTOR GALLERY",
      vehicles: "VEHICULOS",
      about: "Sobre nosotros",
      showroom: "Showroom Sant Cugat",
      findCar: "Encontramos tu coche",
      latest: "Ultimas incorporaciones",
      stock: "Stock de vehiculos",
      vat: "IVA Deducible",
      social: "SOCIAL",
    },
    cookies: {
      revisit: "Preferencias de consentimiento",
      title: "Valoramos tu privacidad",
      text: "Usamos cookies para mejorar su experiencia de navegación, mostrarle anuncios o contenidos personalizados y analizar nuestro tráfico. Al hacer clic en “Aceptar todo” usted da su consentimiento a nuestro uso de las cookies.",
      customize: "Personalizar",
      reject: "Rechazar todo",
      accept: "Aceptar todo",
    },
    stock: {
      title: "STOCK",
      text: "Página placeholder para que los enlaces de la landing no queden rotos. Aquí se puede implementar el listado real más adelante.",
      back: "VOLVER A INICIO",
    },
    vehicle: {
      photoPlaceholder: "FOTO",
    },
  },
  en: {
    header: {
      menu: "MENU",
      closeMenu: "Close menu",
      openMenu: "Open menu",
      language: "Language",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    search: {
      brand: "Brand",
      allBrands: "All brands",
      model: "Model",
      selectBrandFirst: "Select a brand",
      vat: "VAT",
      allVat: "All",
      vatDeductible: "VAT Deductible",
      vatNotDeductible: "VAT Not Deductible",
      search: "SEARCH",
    },
    hero: {
      title: "Stop dreaming... start driving!",
      description:
        "At ICONIC Motor Gallery we have your dream car. We’ve been buying and selling high-end vehicles since 2001 and currently have a stock of over 140 cars.",
      ctaLatest: "LATEST ARRIVALS",
    },
    features: {
      items: [
        "Over 140 cars in stock",
        "Custom orders",
        "Personal service",
        "Home delivery across Spain",
        "Free parking for customers",
        "We buy your car back",
      ],
    },
    latest: {
      title: "LATEST ARRIVALS",
      results: (count) => `${count} RESULTS`,
      viewStock: "VIEW STOCK",
    },
    dream: {
      title: "WE FIND YOUR DREAM CAR",
      description:
        "If you're looking for your dream car, look no further than Iconic Motor Gallery. We’re one of Spain’s leading luxury car dealerships, dedicated to finding the perfect vehicle for you. Whatever your dream is, we make it real.",
    },
    form: {
      name: "Name*",
      surname: "Surname*",
      email: "Email*",
      phone: "Phone*",
      comments: "Comments*",
      notRobot: "I'm not a robot",
      recaptcha: "reCAPTCHA",
      recaptchaPlaceholder: "Visual placeholder (no integration).",
      privacyAccept: "I accept the",
      privacyPolicy: "Privacy Policy",
      marketingAccept:
        "I agree to receive commercial information, including by email.",
      send: "SEND",
      sentPlaceholder: "Sent (placeholder).",
      dataProtection:
        "DATA PROTECTION INFORMATION. Purposes: Respond to your requests and send commercial information about our products and services. Recipients: No data transfers are planned. Rights: You can withdraw your consent at any time.",
    },
    footer: {
      company: "ICONIC MOTOR GALLERY",
      vehicles: "VEHICLES",
      about: "About us",
      showroom: "Sant Cugat showroom",
      findCar: "We find your car",
      latest: "Latest arrivals",
      stock: "Vehicle stock",
      vat: "VAT deductible",
      social: "SOCIAL",
    },
    cookies: {
      revisit: "Consent preferences",
      title: "We value your privacy",
      text: "We use cookies to improve your browsing experience, show personalized ads or content, and analyze our traffic. By clicking “Accept all” you consent to our use of cookies.",
      customize: "Customize",
      reject: "Reject all",
      accept: "Accept all",
    },
    stock: {
      title: "STOCK",
      text: "Placeholder page so landing links don’t break. The real listing can be implemented later.",
      back: "BACK TO HOME",
    },
    vehicle: {
      photoPlaceholder: "PHOTO",
    },
  },
};

export function isLanguage(value: string): value is Language {
  return (supportedLanguages as readonly string[]).includes(value);
}
