import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { getUserAuth } from "~/utils/auth.server";
import { Header } from "~/components/layout/Header";

import "~/styles/global.css";

export const links: LinksFunction = () => [
  { 
    rel: "icon", 
    type: "image/svg+xml", 
    href: "/favicon.svg",
    sizes: "any"
  },
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png",
    sizes: "180x180"
  },
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon-96x96.png",
    sizes: "96x96"
  },
  {
    rel: "shortcut icon",
    href: "/favicon.ico",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest"
  }
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserAuth(request).catch(() => null);
  return json({ user });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header user={user} />
        <Outlet context={{ user }} />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
