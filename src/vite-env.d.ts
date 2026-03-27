/// <reference types="vite/client" />

interface CashfreeCheckoutInstance {
	checkout: (options: {
		paymentSessionId: string;
		redirectTarget?: "_self" | "_blank";
	}) => Promise<unknown>;
}

interface Window {
	Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeCheckoutInstance;
}
