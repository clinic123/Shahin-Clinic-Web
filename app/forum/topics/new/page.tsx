import NewTopicForm from "@/components/forum/NewTopicForm";

export default async function NewTopicPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Start New Topic</h1>
        <p className="text-gray-600 mt-2">
          Share your question or idea with the community
        </p>
      </div>
      <NewTopicForm />
    </div>
  );
}
