type ErrorAlertProps = {
  message: string;
};

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <p className="ph-alert ph-alert--error" role="alert">
      {message}
    </p>
  );
}
