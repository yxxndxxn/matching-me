// 인증 관련 레이아웃 (공통 헤더/푸터 없음)

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
