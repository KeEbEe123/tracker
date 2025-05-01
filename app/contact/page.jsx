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
                <h2 className="font-medium mb-1">Email Us</h2>
                <p
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  className="mb-2"
                >
                  Our team will respond within 24 hours
                </p>
                <a
                  href="mailto:contact@example.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  contact@example.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-1" />
              <div>
                <h2 className="font-medium mb-1">Call Us</h2>
                <p
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  className="mb-2"
                >
                  Available Monday-Friday, 9am-5pm
                </p>
                <a
                  href="tel:+11234567890"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  +1 (123) 456-7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-1" />
              <div>
                <h2 className="font-medium mb-1">Visit Us</h2>
                <p
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  className="mb-2"
                >
                  Come say hello at our office
                </p>
                <address className="not-italic">
                  123 Main Street
                  <br />
                  Suite 456
                  <br />
                  San Francisco, CA 94102
                </address>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-medium mb-4">Send us a message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="block text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--input))",
                    }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--input))",
                    }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  className="block text-sm font-medium mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  style={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--input))",
                  }}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  className="block text-sm font-medium mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  style={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--input))",
                  }}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
