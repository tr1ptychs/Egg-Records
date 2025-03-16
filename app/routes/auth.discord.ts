import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.authenticate("discord", request);
}

// Handle the callback
export async function action({ request }: ActionFunctionArgs) {
  return auth.authenticate("discord", request);
}
