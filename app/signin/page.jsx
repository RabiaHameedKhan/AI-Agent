import SignInForm from "./SignInForm";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/post-login";
  const queryError = params?.error || "";

  return <SignInForm callbackUrl={callbackUrl} queryError={queryError} />;
}
