'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldX, Send, Loader2, CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores';
import { removeAuthCookie } from '@/lib';
import { contactService } from '@/services';
import type { ContactType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SuspendedPage() {
  const { user, clearUser } = useUserStore();

  const [isContactDialogOpen, setIsContactDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string; email: string; message: string }>({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    clearUser();
    removeAuthCookie();
  }, [clearUser]);

  useEffect(() => {
    if (user && isContactDialogOpen) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email || ''
      }));
    }
  }, [user, isContactDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await contactService.createContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        type: 'suspended' as ContactType,
      });
      
      setIsSubmitted(true);
      toast.success('Message sent successfully! We\'ll review your case and get back to you soon.');
      
      setTimeout(() => {
        setIsSubmitted(false);
        setIsContactDialogOpen(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to send message';
      toast.error('Failed to send message', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-[500px] bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-linear-to-tl from-neutral-400/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto text-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="size-32 mx-auto mb-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <ShieldX className="size-16 text-neutral-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Access{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
            Denied
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-neutral-400 mb-12 leading-relaxed max-w-xl mx-auto"
        >
          Your account has been suspended. Please contact the administrator for support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-10 border-t border-neutral-800"
        >
          <p className="text-lg text-neutral-500 mb-6">Need help?</p>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsContactDialogOpen(true)}
            className="py-7 text-lg rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 shadow-lg shadow-black/20"
          >
            Contact Support
          </Button>
        </motion.div>
      </main>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Contact Support
            </DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              Please provide details about your account suspension. We&apos;ll review your case and respond as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="contact-name" className="text-base text-neutral-300">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="h-12! text-base! bg-neutral-800 border-neutral-700"
                required
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="contact-email" className="text-base text-neutral-300">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12! text-base! bg-neutral-800 border-neutral-700"
                required
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="contact-message" className="text-base text-neutral-300">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Please explain your situation and why you believe your account should be reinstated..."
                value={formData.message}
                onChange={handleInputChange}
                className="min-h-[150px] text-base! bg-neutral-800 border-neutral-700 resize-none"
                required
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsContactDialogOpen(false);
                  setFormData({ name: '', email: '', message: '' });
                  setIsSubmitted(false);
                }}
                disabled={isSubmitting || isSubmitted}
                className="h-11! text-base!"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="h-11! text-base!"
              >
                {isSubmitting ? (
                  <>
                    Sending...
                    <Loader2 className="size-4 animate-spin" />
                  </>
                ) : isSubmitted ? (
                  <>
                    Message Sent!
                    <CheckCircle2 className="size-4" />
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}