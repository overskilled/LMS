import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/become-affiliate"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Application
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Affiliate Program Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last Updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="leading-relaxed text-muted-foreground">
                Welcome to the NMD (Nanosatellites Missions Design) Affiliate Program. These Terms of Service ("Terms")
                govern your participation in our affiliate program for our learning platform. By submitting an
                application to become an affiliate, you agree to be bound by these Terms.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                NMD specializes in designing space missions and providing satellite imagery services. Our learning
                platform offers educational content related to nanosatellite technology, space mission design, and
                satellite data analysis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Affiliate Program Overview</h2>
              <p className="leading-relaxed text-muted-foreground">
                The NMD Affiliate Program allows approved partners to promote our learning platform and earn commissions
                on qualifying referrals. Affiliates will receive unique tracking links to share with their audience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Eligibility Requirements</h2>
              <p className="leading-relaxed text-muted-foreground">
                To participate in our affiliate program, you must:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Provide accurate and complete information during the application process</li>
                <li>Submit valid government-issued identification (passport or national ID)</li>
                <li>Maintain an active website, blog, social media presence, or other promotional platform</li>
                <li>Comply with all applicable laws and regulations in your country of residence</li>
                <li>Not engage in fraudulent, deceptive, or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Application and Approval</h2>
              <p className="leading-relaxed text-muted-foreground">
                All affiliate applications are subject to review and approval by NMD. We reserve the right to accept or
                reject any application at our sole discretion. Approval typically takes 2-3 business days. We prioritize
                applications from partners in African countries as part of our commitment to expanding educational
                opportunities in the region.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Affiliate Responsibilities</h2>
              <p className="leading-relaxed text-muted-foreground">As an approved affiliate, you agree to:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Promote NMD's learning platform in a professional and ethical manner</li>
                <li>Accurately represent our services and not make false or misleading claims</li>
                <li>Comply with all applicable advertising and marketing laws</li>
                <li>Not use spam, unsolicited emails, or deceptive marketing practices</li>
                <li>Not bid on NMD's trademarked terms in paid search campaigns</li>
                <li>Disclose your affiliate relationship in accordance with FTC guidelines and local regulations</li>
                <li>Not impersonate NMD or create confusion about your relationship with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Commission Structure</h2>
              <p className="leading-relaxed text-muted-foreground">
                Commission rates and payment terms will be provided upon approval of your affiliate application.
                Commissions are earned on qualifying purchases made through your unique affiliate links. We reserve the
                right to modify commission rates with 30 days' notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Payment Terms</h2>
              <p className="leading-relaxed text-muted-foreground">
                Payments are processed monthly for commissions exceeding the minimum threshold. You are responsible for
                providing accurate payment information and for any taxes applicable to your earnings. Payment methods
                may vary by country and region.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Prohibited Activities</h2>
              <p className="leading-relaxed text-muted-foreground">Affiliates are strictly prohibited from:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Generating fraudulent clicks, impressions, or conversions</li>
                <li>Using automated systems or bots to generate traffic</li>
                <li>Cookie stuffing or other deceptive tracking practices</li>
                <li>Self-referrals or referring immediate family members</li>
                <li>Promoting illegal activities or adult content alongside NMD materials</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Intellectual Property</h2>
              <p className="leading-relaxed text-muted-foreground">
                NMD grants you a limited, non-exclusive, revocable license to use our trademarks, logos, and marketing
                materials solely for promoting our learning platform. You may not modify our materials without prior
                written consent. All intellectual property rights remain with NMD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Termination</h2>
              <p className="leading-relaxed text-muted-foreground">
                Either party may terminate this agreement at any time with written notice. NMD reserves the right to
                immediately terminate your affiliate account for violation of these Terms. Upon termination, you must
                cease all promotional activities and remove any NMD materials from your platforms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Limitation of Liability</h2>
              <p className="leading-relaxed text-muted-foreground">
                NMD shall not be liable for any indirect, incidental, special, or consequential damages arising from
                your participation in the affiliate program. Our total liability shall not exceed the commissions earned
                in the three months preceding any claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">12. Data Protection and Privacy</h2>
              <p className="leading-relaxed text-muted-foreground">
                Your personal information will be processed in accordance with our Privacy Policy. By participating in
                the affiliate program, you consent to the collection and use of your data as described in our Privacy
                Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">13. Modifications to Terms</h2>
              <p className="leading-relaxed text-muted-foreground">
                NMD reserves the right to modify these Terms at any time. We will notify affiliates of material changes
                via email. Continued participation in the program after changes constitutes acceptance of the modified
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">14. Governing Law</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms shall be governed by and construed in accordance with international commercial law. Any
                disputes shall be resolved through arbitration in accordance with international arbitration rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">15. Contact Information</h2>
              <p className="leading-relaxed text-muted-foreground">
                For questions about these Terms or the affiliate program, please contact us at:
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Email: affiliates@nanosatellitemissions.com
                <br />
                NMD - Nanosatellites Missions Design
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">16. Entire Agreement</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and NMD
                regarding the affiliate program and supersede all prior agreements and understandings.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
