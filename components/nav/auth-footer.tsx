import { applicationProduct } from "@/content/application";

export function AuthFooter() {
  return (
    <footer className="px-6 py-6 text-center">
      <p className="type-caption text-foreground">
        &copy; {new Date().getFullYear()} {applicationProduct.name}. All rights
        reserved.
      </p>
    </footer>
  );
}
