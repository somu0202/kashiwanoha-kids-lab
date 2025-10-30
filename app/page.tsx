import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">
              Kashiwanoha Kids Lab
            </h1>
            <p className="text-2xl text-gray-600">
              子どもの運動能力評価システム
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              7つの基礎動作とSMC-Kidsの測定結果を記録し、
              レーダーチャート付きレポートで成長を可視化します
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <div className="text-4xl">📊</div>
              <h3 className="text-xl font-semibold">可視化レポート</h3>
              <p className="text-gray-600">
                レーダーチャートとA4 PDFで運動能力を分かりやすく表示
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <div className="text-4xl">📈</div>
              <h3 className="text-xl font-semibold">成長の追跡</h3>
              <p className="text-gray-600">
                時系列での比較で子どもの成長過程を記録
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <div className="text-4xl">🔗</div>
              <h3 className="text-xl font-semibold">簡単共有</h3>
              <p className="text-gray-600">
                保護者と安全にレポートを共有できるリンク機能
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600">
              <Link href="/auth/login">ログイン</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">ダッシュボード</Link>
            </Button>
          </div>

          {/* 7 Basic Movements */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              評価する7つの基礎動作
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="text-3xl">🏃</div>
                <p className="font-semibold">走る</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🤸</div>
                <p className="font-semibold">平均台移動</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🦘</div>
                <p className="font-semibold">跳ぶ</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">⚾</div>
                <p className="font-semibold">投げる</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🥎</div>
                <p className="font-semibold">捕る</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">⛹️</div>
                <p className="font-semibold">つく</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🤾</div>
                <p className="font-semibold">転がる</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">📏</div>
                <p className="font-semibold text-sm">SMC-Kids<br />測定</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
