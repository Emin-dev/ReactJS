import { useSubmit } from '@formspree/react';
import { useState } from 'react';
import cx from 'classnames';
import { Formik, Form, FastField, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Recaptcha from 'react-google-recaptcha';

const ContactForm = () => {
  const formId = process.env.NEXT_PUBLIC_FORM || '';
  const siteKey = process.env.NEXT_PUBLIC_PORTFOLIO_RECAPTCHA_KEY || '';
  const configured = Boolean(formId && siteKey);
  const handleSubmit = useSubmit(formId);
  const [succeeded, setSucceeded] = useState(false);
  const [formError, setFormError] = useState('');

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        message: '',
        recaptcha: '',
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required('Full name field is required'),
        email: Yup.string().email('Invalid email').required('Email field is required'),
        message: Yup.string().required('Message field is required'),
        recaptcha: Yup.string().required('Robots are not welcome yet!'),
      })}
      onSubmit={async ({ name, email, message, recaptcha }, { setSubmitting, resetForm, setFieldError }) => {
        if (!configured) {
          setSubmitting(false);
          return;
        }
        setSucceeded(false);
        setFormError('');
        try {
          const result = await handleSubmit({ name, email, message, 'g-recaptcha-response': recaptcha });
          if (result.kind === 'error') {
            for (const [field, errors] of result.getAllFieldErrors()) {
              setFieldError(String(field), errors.map((error) => error.message).join(' '));
            }
            setFormError(result.getFormErrors().map((error) => error.message).join(' ') || 'Please check the form and try again.');
          } else {
            setSucceeded(true);
            resetForm();
          }
        } catch {
          setFormError('Something went wrong, please try again!');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, touched, errors, setFieldValue, isSubmitting }) => (
        <Form>
          <div className="relative mb-4">
            <FastField
              type="text"
              name="name"
              component="input"
              aria-label="name"
              placeholder="Full name*"
              className={cx('input', {
                'input-error': touched.name && errors.name,
              })}
            />
            <ErrorMessage className="text-red-600 block mt-1" component="span" name="name" />
          </div>
          <div className="relative mb-4">
            <FastField
              id="email"
              aria-label="email"
              component="input"
              type="email"
              name="email"
              placeholder="Email*"
              className={cx('input', {
                'input-error': touched.email && errors.email,
              })}
            />
            <ErrorMessage className="text-red-600 block mt-1" component="span" name="email" />
          </div>
          <div className="relative mb-4">
            <FastField
              component="textarea"
              aria-label="message"
              id="message"
              rows="8"
              type="text"
              name="message"
              placeholder="Message*"
              className={cx('input', {
                'input-error': touched.message && errors.message,
              })}
            />
            <ErrorMessage className="text-red-600 block mt-1" component="span" name="message" />
          </div>
          {values.name && values.email && values.message && configured && (
            <div className="relative mb-4">
              <FastField
                component={Recaptcha}
                sitekey={siteKey}
                name="recaptcha"
                onChange={(value: string | null) => setFieldValue('recaptcha', value || '')}
                onExpired={() => setFieldValue('recaptcha', '')}
                onErrored={() => setFieldValue('recaptcha', '')}
              />
              <ErrorMessage className="text-red-600 block mt-1" component="span" name="recaptcha" />
            </div>
          )}
          {succeeded && (
            <div className="relative mb-4">
              <div className="text-center" role="status">
                <h4 className="font-normal">Your message has been successfully sent, I will get back to you ASAP!</h4>
              </div>
            </div>
          )}
          {!configured && <p role="status" className="mb-4">The contact form is not configured yet.</p>}
          {formError && <p role="alert" className="text-red-600 block mb-4">{formError}</p>}
          <div className="text-left">
            <button type="submit" className="button button-secondary" disabled={isSubmitting || !configured}>
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContactForm;
