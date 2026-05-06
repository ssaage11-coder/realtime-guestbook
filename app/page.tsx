import AuthStatus from '@/components/auth-status';
import DrawingBoard from '@/components/drawing-board';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-8 px-4 py-8 font-hand sm:py-12">
      <div className="w-full">
        <AuthStatus />
      </div>
      <h1 className="text-6xl">전자 방명록</h1>
      <DrawingBoard />
    </main>
  );
}
