const VerifyEmailPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center">
      <h1 className="text-3xl font-bold">Please Verify Your Email</h1>
      <p className="mt-4 text-lg">
        A verification link has been sent to your email address.
      </p>
      <p className="mt-2">Please click the link to complete your registration.</p>
    </div>
  );
}

export default VerifyEmailPage;