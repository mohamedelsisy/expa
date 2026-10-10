<?php

namespace Database\Seeders;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Geo\Models\City;
use Illuminate\Database\Seeder;

class VerifiedItalyJobsV1Seeder extends Seeder
{
    /**
     * Minimal, manually curated job metadata from the employers' own public career pages.
     * Recheck the original application URL before re-running or publishing in production.
     */
    public function run(): void
    {
        $source = JobSource::updateOrCreate(
            ['key' => 'verified-italy-careers-v1'],
            [
                'name' => 'Amazon Jobs — manually verified listings',
                'driver' => 'json_feed',
                'config' => null,
                'legal_basis' => 'Manual curation of minimal vacancy metadata from the employer public career pages, with direct links to the original listing. Do not scrape or republish full descriptions. Re-verify each link and status before production publication.',
                'active' => false,
                'schedule_hours' => 24,
            ],
        );

        $jobs = [
            [
                'id' => 'amazon-10409907',
                'title' => 'Area Manager, FC Operations',
                'location' => 'Alessandria, Piemonte',
                'city' => 'alessandria',
                'category' => 'logistics',
                'type' => 'full_time',
                'salary_min' => 46000,
                'salary_max' => 46000,
                'salary_period' => 'year',
                'published_at' => '2026-10-09 00:00:00',
                'url' => 'https://www.amazon.jobs/en/jobs/10409907/area-manager-fc-operations',
                'description' => 'Amazon Italia Logistica S.R.L. — full-time operations leadership role in Alessandria. The employer lists a minimum gross base salary of €46,000 per year. The listing asks for a degree, people-management experience, English proficiency and an intermediate level of the local language. Review the employer page for complete requirements.',
                'skills' => ['operations', 'people management', 'supply chain', 'data analysis'],
                'italian_level' => 'b1',
                'english_level' => 'b2',
                'experience_years' => 2,
            ],
            [
                'id' => 'amazon-10555833',
                'title' => 'RME Automation Engineer',
                'location' => 'Torrazza Piemonte, Piemonte',
                'city' => 'torrazza-piemonte',
                'category' => 'tech',
                'type' => 'full_time',
                'salary_min' => 42800,
                'salary_max' => 42800,
                'salary_period' => 'year',
                'published_at' => '2026-10-09 00:00:00',
                'url' => 'https://www.amazon.jobs/en/jobs/10555833/rme-automation-engineer',
                'description' => 'Amazon Italia Logistica S.R.L. — automation and maintenance engineering role in Torrazza Piemonte. The employer lists a minimum gross base salary of €42,800 per year. The listing asks for experience with PLC-based automation and diagnostics in production environments. Check the original page for the complete qualifications.',
                'skills' => ['automation', 'PLC', 'engineering', 'maintenance'],
                'italian_level' => 'b1',
                'english_level' => null,
                'experience_years' => 2,
            ],
            [
                'id' => 'amazon-10425214',
                'title' => 'HR Specialist with Italian & English — 12-month contract',
                'location' => 'Rome, Lazio',
                'city' => 'roma',
                'category' => 'admin',
                'type' => 'contract',
                'salary_min' => 26800,
                'salary_max' => 26800,
                'salary_period' => 'year',
                'published_at' => '2026-10-02 00:00:00',
                'url' => 'https://amazon.jobs/en/jobs/10425214/hr-specialist-with-italian-english-fixed-term-contract-12-months-disability-leave-services',
                'description' => 'Amazon Italia Services Srl — 12-month fixed-term HR specialist role in Rome. The employer lists a minimum gross base salary of €26,800 per year and asks for a related degree, HR or employee-support experience, and high proficiency in Italian and English. The listing notes a preference for candidates covered by the relevant Italian protected-category provision; review the full criteria on the original page.',
                'skills' => ['human resources', 'employee support', 'Microsoft Office', 'communication'],
                'italian_level' => 'b2',
                'english_level' => 'b2',
                'experience_years' => 1,
            ],
            [
                'id' => 'amazon-10567698',
                'title' => 'Data Center Technician — 2027 Internship',
                'location' => 'Milan, Lombardia',
                'city' => 'milano',
                'category' => 'tech',
                'type' => 'internship',
                'salary_min' => 1080,
                'salary_max' => 1080,
                'salary_period' => 'month',
                'published_at' => '2026-10-02 00:00:00',
                'url' => 'https://amazon.jobs/en-gb/jobs/10567698/data-center-technician-2027-internship',
                'description' => 'AWS EMEA SARL (Italy Branch) — full-time, on-site internship in Milan starting in summer 2027. The employer lists €1,080 per month. Applicants should be pursuing a relevant technical bachelor degree with graduation in 2027/2028, have professional English and access to their own transport. See the employer page for the full conditions.',
                'skills' => ['IT support', 'computer hardware', 'networking', 'Linux'],
                'italian_level' => null,
                'english_level' => 'b2',
                'experience_years' => 0,
            ],
            [
                'id' => 'amazon-10516571',
                'title' => 'Operations Manager, FC Operations',
                'location' => 'Alessandria, Piemonte',
                'city' => 'alessandria',
                'category' => 'logistics',
                'type' => 'full_time',
                'salary_min' => 64800,
                'salary_max' => 64800,
                'salary_period' => 'year',
                'published_at' => '2026-10-10 00:00:00',
                'url' => 'https://www.amazon.jobs/en/jobs/10516571/operations-manager-fc-operations',
                'description' => 'Amazon Italia Logistica S.R.L. — full-time operations management role in Alessandria. The employer lists a minimum gross base salary of €64,800 per year and asks for a degree, people-management experience, English proficiency, and experience in operations or supply chain. Check the original posting for the full requirements and current status.',
                'skills' => ['operations management', 'supply chain', 'leadership', 'data analysis'],
                'italian_level' => 'b1',
                'english_level' => 'b2',
                'experience_years' => 3,
            ],
        ];

        $publishLocally = app()->environment('local', 'testing');

        foreach ($jobs as $job) {
            $cityId = City::where('slug', $job['city'])->value('id');
            $attrs = [
                'job_source_id' => $source->id,
                'external_id' => $job['id'],
                'title' => $job['title'],
                'company' => str_starts_with($job['id'], 'amazon-') ? 'Amazon / AWS' : 'Employer',
                'city_id' => $cityId,
                'location_text' => $job['location'],
                'remote_mode' => 'onsite',
                'employment_type' => $job['type'],
                'category' => $job['category'],
                'salary_min' => $job['salary_min'],
                'salary_max' => $job['salary_max'],
                'salary_currency' => 'EUR',
                'salary_period' => $job['salary_period'],
                'italian_level' => $job['italian_level'],
                'english_level' => $job['english_level'],
                'experience_years' => $job['experience_years'],
                'skills' => $job['skills'],
                'description' => $job['description'],
                'apply_url' => $job['url'],
                'visa_sponsorship_stated' => false,
                'published_at' => $job['published_at'],
                'expires_at' => '2026-10-24 23:59:59',
                'status' => $publishLocally ? 'published' : 'hidden',
            ];
            $attrs['dedupe_hash'] = sha1(mb_strtolower($attrs['company'].'|'.$attrs['title'].'|'.$attrs['location_text']));
            $attrs['content_hash'] = sha1(json_encode([$attrs['title'], $attrs['company'], $attrs['description'], $attrs['apply_url'], $attrs['expires_at'], $attrs['salary_min'], $attrs['salary_max']]));

            JobListing::updateOrCreate(
                ['job_source_id' => $source->id, 'external_id' => $job['id']],
                $attrs,
            );
        }
    }
}
