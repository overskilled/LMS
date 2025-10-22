import AffiliateForm from "@/components/affiliate-form"
import MainLayout from "../main-layout"

export default function AffiliatePage() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Become an <span className="text-blue-500">NMD</span> Affiliate Partner
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Join our affiliate program and start earning commissions by promoting our courses. Complete the form below
              to get started.
            </p>
          </div>

          <AffiliateForm />
        </div>
      </main>
    </MainLayout>
  )
}
