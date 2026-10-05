import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <h1 className="text-3xl font-semibold">해외 AI 뉴스 요약</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인하고 한국어로 요약된 AI 뉴스를 확인하세요.
          </p>
          <div className="flex gap-3">
            <SignInButton mode="modal">
              <button className="rounded-full bg-black px-5 py-2 text-white dark:bg-white dark:text-black">
                로그인
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full border border-zinc-300 px-5 py-2 dark:border-zinc-700">
                회원가입
              </button>
            </SignUpButton>
          </div>
        </main>
      </Show>
      <Show when="signed-in">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <span className="font-semibold">해외 AI 뉴스 요약</span>
          <UserButton />
        </header>
        <main className="flex-1 p-6">{/* 뉴스 기능은 이후 단계에서 구현 */}</main>
      </Show>
    </>
  );
}
