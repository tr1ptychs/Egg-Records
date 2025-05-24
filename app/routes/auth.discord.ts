import { type LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.authenticate("discord", request, {
    successRedirect: "/",
    failureRedirect: "/",
  });
}
