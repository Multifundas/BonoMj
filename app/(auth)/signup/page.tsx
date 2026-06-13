import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "../AuthForm";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
        <CardDescription>
          Registra horas, metas y mira crecer tu compensación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode="signup" />
      </CardContent>
    </Card>
  );
}
