import { Spinner } from "@/components/ui/spinner";

const loading = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};

export default loading;
