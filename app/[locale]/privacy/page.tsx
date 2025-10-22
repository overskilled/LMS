import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
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
                        <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                        <p className="text-sm text-muted-foreground">Last Updated: January 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
                        <section>
                            <h2 className="text-xl font-semibold">1. Introduction</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                NMD (Nanosatellites Missions Design) ("we," "us," or "our") is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                                apply to and participate in our affiliate program for our learning platform.
                            </p>
                            <p className="leading-relaxed text-muted-foreground">
                                We specialize in designing space missions and providing satellite imagery services, and our learning
                                platform offers educational content in these areas. This policy applies to all affiliate program
                                participants and applicants.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                            <h3 className="text-lg font-medium">2.1 Personal Information</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                When you apply to our affiliate program, we collect:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>Full name (first and last name)</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Country of residence</li>
                                <li>Company name (if applicable)</li>
                                <li>Website or social media URLs</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-medium">2.2 Identity Verification Documents</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                To comply with legal requirements and prevent fraud, we collect copies of government-issued
                                identification documents, including:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>Passport</li>
                                <li>National ID card</li>
                                <li>Driver's license</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-medium">2.3 Financial Information</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                For commission payments, we collect payment information such as bank account details or payment
                                processor information.
                            </p>

                            <h3 className="mt-4 text-lg font-medium">2.4 Automatically Collected Information</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                We automatically collect certain information when you use our affiliate platform:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>IP address and location data</li>
                                <li>Browser type and version</li>
                                <li>Device information</li>
                                <li>Referral data and affiliate link performance</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We use your information for the following purposes:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>Processing and evaluating your affiliate application</li>
                                <li>Verifying your identity and preventing fraud</li>
                                <li>Managing your affiliate account and tracking referrals</li>
                                <li>Calculating and processing commission payments</li>
                                <li>Communicating with you about the affiliate program</li>
                                <li>Providing customer support and responding to inquiries</li>
                                <li>Complying with legal obligations and tax requirements</li>
                                <li>Improving our affiliate program and services</li>
                                <li>Detecting and preventing fraudulent activities</li>
                                <li>Sending program updates, newsletters, and promotional materials (with your consent)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">4. Legal Basis for Processing (GDPR)</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                For users in the European Economic Area and other jurisdictions with similar regulations, we process
                                your personal data based on:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>
                                    <strong>Contract Performance:</strong> Processing necessary to fulfill our affiliate agreement with
                                    you
                                </li>
                                <li>
                                    <strong>Legal Obligation:</strong> Compliance with tax laws, anti-fraud regulations, and identity
                                    verification requirements
                                </li>
                                <li>
                                    <strong>Legitimate Interests:</strong> Fraud prevention, program improvement, and business operations
                                </li>
                                <li>
                                    <strong>Consent:</strong> Marketing communications and optional data processing (which you can
                                    withdraw at any time)
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">5. How We Share Your Information</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>
                                    <strong>Service Providers:</strong> Third-party companies that help us operate the affiliate program
                                    (payment processors, analytics providers, hosting services)
                                </li>
                                <li>
                                    <strong>Legal Authorities:</strong> When required by law or to protect our rights and safety
                                </li>
                                <li>
                                    <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales
                                </li>
                                <li>
                                    <strong>With Your Consent:</strong> When you explicitly authorize us to share your information
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">6. International Data Transfers</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                As we serve affiliates globally, particularly in African countries, your information may be transferred
                                to and processed in countries other than your country of residence. We ensure appropriate safeguards are
                                in place to protect your data in accordance with this Privacy Policy and applicable laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">7. Data Security</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We implement appropriate technical and organizational security measures to protect your personal
                                information, including:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>Encryption of data in transit and at rest</li>
                                <li>Secure storage of identity documents</li>
                                <li>Access controls and authentication measures</li>
                                <li>Regular security assessments and updates</li>
                                <li>Employee training on data protection</li>
                            </ul>
                            <p className="leading-relaxed text-muted-foreground">
                                However, no method of transmission over the internet is 100% secure. While we strive to protect your
                                information, we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">8. Data Retention</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this
                                Privacy Policy, unless a longer retention period is required by law. Specifically:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>Active affiliate accounts: Duration of participation plus 7 years for tax and legal compliance</li>
                                <li>Rejected applications: 1 year from rejection date</li>
                                <li>Identity documents: 7 years after account closure for regulatory compliance</li>
                                <li>Financial records: 7 years for tax purposes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">9. Your Rights and Choices</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                                <li>
                                    <strong>Access:</strong> Request a copy of the personal information we hold about you
                                </li>
                                <li>
                                    <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                                </li>
                                <li>
                                    <strong>Deletion:</strong> Request deletion of your personal information (subject to legal
                                    obligations)
                                </li>
                                <li>
                                    <strong>Portability:</strong> Request transfer of your data to another service
                                </li>
                                <li>
                                    <strong>Objection:</strong> Object to certain processing activities
                                </li>
                                <li>
                                    <strong>Restriction:</strong> Request restriction of processing in certain circumstances
                                </li>
                                <li>
                                    <strong>Withdraw Consent:</strong> Withdraw consent for processing based on consent
                                </li>
                            </ul>
                            <p className="leading-relaxed text-muted-foreground">
                                To exercise these rights, please contact us at privacy@nmd-space.com. We will respond within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">10. Cookies and Tracking Technologies</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We use cookies and similar technologies to track affiliate referrals, analyze performance, and improve
                                user experience. You can control cookies through your browser settings, but disabling cookies may affect
                                affiliate tracking functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">11. Children's Privacy</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                Our affiliate program is not intended for individuals under 18 years of age. We do not knowingly collect
                                information from children. If we discover we have collected information from a child, we will delete it
                                promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">12. Third-Party Links</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                Our affiliate platform may contain links to third-party websites. We are not responsible for the privacy
                                practices of these external sites. We encourage you to review their privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">13. Changes to This Privacy Policy</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                We may update this Privacy Policy periodically to reflect changes in our practices or legal
                                requirements. We will notify you of material changes via email or through our affiliate platform. The
                                "Last Updated" date at the top indicates when the policy was last revised.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">14. Regional Specific Information</h2>
                            <h3 className="text-lg font-medium">14.1 African Union Data Protection</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                For affiliates in African Union member states, we comply with applicable regional data protection
                                frameworks and conventions. We are committed to supporting data sovereignty and local data protection
                                requirements.
                            </p>

                            <h3 className="mt-4 text-lg font-medium">14.2 GDPR (European Economic Area)</h3>
                            <p className="leading-relaxed text-muted-foreground">
                                For EEA residents, you have additional rights under GDPR, including the right to lodge a complaint with
                                your local supervisory authority.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">15. Contact Us</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please
                                contact us:
                            </p>
                            <p className="leading-relaxed text-muted-foreground">
                                Email: privacy@nmd-space.com
                                <br />
                                Data Protection Officer: dpo@nmd-space.com
                                <br />
                                NMD - Nanosatellites Missions Design
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">16. Consent</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                By submitting your affiliate application and participating in our program, you acknowledge that you have
                                read, understood, and agree to this Privacy Policy.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
