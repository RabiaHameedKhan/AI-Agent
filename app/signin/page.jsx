import SignInForm from "./SignInForm";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/post-login";
  const queryError = params?.error || "";
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return <SignInForm callbackUrl={callbackUrl} queryError={queryError} googleEnabled={googleEnabled} />;
}
