import ActionLink from './ActionLink';

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="ui-section-heading">
      <div>
        <p className="ui-section-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        {description && <p className="ui-section-description">{description}</p>}
      </div>
      {action && <ActionLink href={action.href}>{action.label}</ActionLink>}
    </div>
  );
}
