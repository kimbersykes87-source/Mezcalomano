/**
 * Contact form validation and submission handler
 */

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // Honeypot
}

function validateForm(formData: FormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.subject || formData.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters';
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  // Honeypot check
  if (formData.website) {
    errors.spam = 'Spam detected';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function showError(fieldId: string, message: string) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  const formGroup = field?.closest('.form-group');

  if (formGroup) {
    formGroup.classList.add('error');
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function clearError(fieldId: string) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  const formGroup = field?.closest('.form-group');

  if (formGroup) {
    formGroup.classList.remove('error');
  }

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

function showStatus(message: string, type: 'success' | 'error') {
  const statusElement = document.getElementById('form-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `form-status ${type} show`;
    statusElement.setAttribute('role', type === 'error' ? 'alert' : 'status');
  }
}

function hideStatus() {
  const statusElement = document.getElementById('form-status');
  if (statusElement) {
    statusElement.textContent = '';
    statusElement.className = 'form-status';
    statusElement.removeAttribute('role');
  }
}

export function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement;
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

  // Clear errors on input
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      const fieldId = (input as HTMLElement).id;
      clearError(fieldId);
      hideStatus();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus();

    // Clear previous errors
    inputs.forEach((input) => {
      clearError((input as HTMLElement).id);
    });

    const formData: FormData = {
      name: (form.querySelector('#name') as HTMLInputElement)?.value || '',
      email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
      subject: (form.querySelector('#subject') as HTMLInputElement)?.value || '',
      message: (form.querySelector('#message') as HTMLTextAreaElement)?.value || '',
      website: (form.querySelector('#website') as HTMLInputElement)?.value || '',
    };

    const validation = validateForm(formData);
    if (!validation.valid) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        if (field !== 'spam') {
          showError(field, message);
        } else {
          showStatus('Spam detected. Your message was not sent.', 'error');
        }
      });
      return;
    }

    // Get reCAPTCHA token
    const recaptchaResponse = (window as any).grecaptcha?.getResponse();
    if (!recaptchaResponse) {
      showStatus('Please complete the reCAPTCHA verification.', 'error');
      return;
    }

    // Disable submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptcha: recaptchaResponse,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showStatus('Thank you! Your message has been sent. We\'ll get back to you soon.', 'success');
        form.reset();
        (window as any).grecaptcha?.reset();
      } else {
        showStatus(result.error || 'Something went wrong. Please try again or email us directly.', 'error');
      }
    } catch (error) {
      showStatus('Network error. Please try again or email us directly at hola@mezcalomano.com', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
}
