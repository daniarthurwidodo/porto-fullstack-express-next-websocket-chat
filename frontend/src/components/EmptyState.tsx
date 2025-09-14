interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div id="empty-state" className="text-center mt-20" data-testid="empty-state">
      {icon && (
        <div id="empty-state-icon" className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h1 id="empty-state-title" className="text-3xl font-bold mb-4 text-blue-900">
        {title}
      </h1>
      <p id="empty-state-description" className="text-blue-600 mb-6">
        {description}
      </p>
      {action && (
        <div id="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}