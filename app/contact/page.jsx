import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>

        <div
          style={{
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
          }}
          className="rounded-lg shadow-sm p-8 border border-border"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-1" />
              <div>
                <h2 className="font-medium mb-1">Email Us for any queries/suggestions.</h2>
                <a
                  href="mailto:contact@example.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  23r21a1285@mlrit.ac.in                  
                </a>
                <div></div>
                <a
                  href="mailto:contact@example.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  23r21a1285@mlrit.ac.in                  
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
