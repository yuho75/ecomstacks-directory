export interface SeedItem {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
  created_at: string;
}

export const SEED_ITEMS: SeedItem[] = [
  {
    id: "seed-shopgen-ai",
    title: "ShopGen AI",
    url: "https://example.com/shopgen",
    description: "Automate your product descriptions and metadata in seconds using trained LLMs for retail.",
    category: "Automation",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGBljR89XVYmNs13jcYk07ccsLZtrVzjZPqd7VYiZkSPRgbhy5GRYsyP4-pMPF6-kyQSxJBfJsAVfLZHnRs6-XAKpLhfHt442BnkxnMipPdGxOMobw2E2DJ3r-ywdPCm8uY-EQkYdzCYE1hdZEsfeZAjIy78U98hQaLXRaHyb_5R9DA3vtq1qpkV3udN-4EK29ZlrFoRHA1OXOcKKaZZJGfyajK-AtMI4v9l18ft9WEtNlbes1ZPmBbJRFEe5-Hxf5sB6zAAQuQQY",
    email: "creator@shopgen.ai",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "seed-pixelperfect",
    title: "PixelPerfect",
    url: "https://example.com/pixelperfect",
    description: "AI-powered image enhancement and background removal optimized for Shopify storefronts.",
    category: "Visual & Design",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXT39R_fZTf8aAQpl5sDPIZjsGWe5CRYhJDv1IDTQKDS2lBTqrWT1vv_-1PFDwFtEslz8TiEIwEIRydc_C7h4dI6SIoVr3vUNNI7xH2GJzajJ-MHFCyl6PSoPVwlPx6t401N2tQspfO2D1nkR2pKLo65FXWAObmhtSr1zkCicWfKVW_S6DZTdM3bwX7lESD1yQuO1MqrgLFOIrldCxPXI4ItASdnq6jFN0KF1B2O0RNgb1k1NjjH29xj7fhtRN5lZ1ZzR_pY2SivU",
    email: "creator@pixelperfect.ai",
    status: "approved",
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "seed-copyflow",
    title: "CopyFlow",
    url: "https://example.com/copyflow",
    description: "High-converting ad copy generator specifically tuned for e-commerce conversion rates.",
    category: "Copywriting & Marketing",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6giOtUhTAJWARO-cDFhUDzAWJhrDcbWJRbwvHmU43F-Fspua4c83LhcK_-ebq66hPzW8q-BwCZjy58bR9qJxquFcsXypIxaLMsHhPDJpglfD_Psl1D1BQCWChnePVBqwp73NTJKUiS-bE0WIHMqNYLEbaEc74wvpqHI5UYd9inoQ2hwgp539WyEcYyxC0UgXjImGXLV5paIJS2ZEzCurNQvhjT0cllq4eEk_3LcDcwvlvhEWOcZjX_oEVndceRf32NNT5IIJZ-Dk",
    email: "creator@copyflow.ai",
    status: "approved",
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "seed-cartboost",
    title: "CartBoost",
    url: "https://example.com/cartboost",
    description: "Advanced cart recovery engine using behavioral triggers and dynamic discounting.",
    category: "Store Optimization",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHwBZtoN0bYHTcm-csI6AMkreF97py9iGT6oznT0o-wYMWACjY_dG39Nu3utTJ_70hNsX18dSDn7lY94etHotQnhjm-ZPvP4ILH9Y5C2O2QbpkttoCR3sEeIGUUBvzzvIyM4ZMmEQQ8UEhxbm7VTYqvtXhX9MQNLOJGrKyNcMpbjdOG9X8ATTeZe04inWInsABJzQ4zpqkEdAu8S61nYEO8RDQWi43fIZBkKBaF5Dga7MXi7-jOHDPBx4fLICePbnRDiQa3BjQAN0",
    email: "creator@cartboost.ai",
    status: "approved",
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: "seed-linkstack",
    title: "LinkStack",
    url: "https://example.com/linkstack",
    description: "Omni-channel link management for influencers and affiliate marketing campaigns.",
    category: "Copywriting & Marketing",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxGntgFzzQafRF09JiDceVk6WlKpgTsMPHS6kK8xs5d-szwL9dHXba8rxoB8IVzXK0TdE8r5XwWZBu_W30JZI1fNqagmmqG0Wezi5Vw5-uu9vvcejnC5_Pg0dqzJmM5B-WvsPLT-H2iscgM3GnLBGyBcfYBkxYnbKvvOE-d9k01dbd1y66QDNa07E3OC-6JUwkqJaNq12P7-QPTe62MwkLCshzbOsKTEu2LKAIP3lo3bsJn-uFaohRa5I92KAtWZhO1pOg2jwpfsc",
    email: "creator@linkstack.ai",
    status: "approved",
    created_at: "2024-01-05T00:00:00Z"
  },
  {
    id: "seed-omnisearch",
    title: "OmniSearch",
    url: "https://example.com/omnisearch",
    description: "Lightning-fast semantic search for large-scale e-commerce product catalogs.",
    category: "Store Optimization",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZNCuiun1u1sxYL5tlt7PkUpco74UqvoRevsi531PO_3VQE1geyYCRBwnZ5QETL15Pn81aX5Eol3XKq5cUwV464q1-68kgy_weA5h7wN3Q54rXU1DzCcgqRWAKVTzt3PuPHpyv3ZjnAEepSKmDFb-F28tz8N0wUoBtUKzrEHGVRI_-g0q9VGoSsMEZDtex-bKSRyel5qmV_KjeQCzrJ-V0kvH-ulfSc6L-vckK6VN1qPhYrukmOFBqHe3CDgp08RQp6kEQV2aBGg",
    email: "creator@omnisearch.ai",
    status: "approved",
    created_at: "2024-01-06T00:00:00Z"
  }
];
