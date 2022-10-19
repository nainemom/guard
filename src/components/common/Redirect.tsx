import { RouterProps, route } from 'preact-router';
import { useEffect } from 'preact/hooks';

type RedirectProps = RouterProps & {
  to: string,
};

export default function Redirect({ path, to }: RedirectProps) {
  useEffect(() => {
    route(to);
  }, []);

  return <div path={path} />;
}
