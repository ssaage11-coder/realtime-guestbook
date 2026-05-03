import DrawingBoard from '@/components/drawing-board';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-8 px-4 py-8 font-hand sm:py-12">
      <h1 className="text-6xl">전자 방명록</h1>
      <DrawingBoard />
      <p className="text-center text-xl">손님이 그림을 그리거나 사진을 첨부해 방명록을 등록하는 첫 화면 UI를 구현 중입니다.</p>
    </main>
  );
}
