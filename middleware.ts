import { withAuth } from "next-auth/middleware";

if (typeof (globalThis as any).__dirname === "undefined") {
  (globalThis as any).__dirname = "/";
}
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/((?!login|register|api|_next/static|_next/image|favicon.ico).*)"],
};
