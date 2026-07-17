import { AuthPortalLogin } from "../components/auth/AuthPortalLogin";

export default function Login() {
  return (
    <AuthPortalLogin
      portal="admin"
      heading="Administrator sign in"
      subheading="Sign in to manage attendance for your institute."
      showRegisterLink={false}
      switchPortal={{ to: "/user-login", label: "Not an admin? Sign in as a user" }}
    />
  );
}
