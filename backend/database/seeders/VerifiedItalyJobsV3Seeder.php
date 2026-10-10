<?php

namespace Database\Seeders;

use App\Domains\Geo\Models\City;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use Illuminate\Database\Seeder;

class VerifiedItalyJobsV3Seeder extends Seeder
{
    /** Add currently open customer-service and retail roles from IKEA's official Italian career site. */
    public function run(): void
    {
        $source = JobSource::updateOrCreate(
            ['key' => 'verified-italy-careers-v3'],
            [
                'name' => 'IKEA Italy Careers — customer service and retail',
                'driver' => 'json_feed',
                'config' => null,
                'legal_basis' => 'Manual curation of minimal vacancy metadata from the employer public career pages, with direct links to original listings. No full descriptions copied. Re-verify before production publication.',
                'active' => false,
                'schedule_hours' => 24,
            ],
        );

        $jobs = [
            [
                'id' => 'ikea-370152',
                'title' => 'Addetto/a al Servizio Clienti & Casse - Part time',
                'company' => 'IKEA',
                'location' => 'Rome, Lazio',
                'city' => 'roma',
                'category' => 'customer_service',
                'type' => 'part_time',
                'url' => 'https://jobs.ikea.com/it/lavoro/roma/addetto-a-al-servizio-clienti-and-casse-part-time/24107/101439736832',
                'description' => 'IKEA — part-time customer relations and checkout role in Rome. Responsibilities include welcoming customers, supporting checkout, explaining services such as returns and delivery/assembly, and helping with after-sales questions. The employer lists a gross annual salary reference of €23,241.12 prorated to the part-time percentage; fixed-term contract and shifts including weekends.',
                'salary' => 23241.12,
                'published_at' => '2026-10-02 00:00:00',
                'skills' => ['customer service', 'cash register', 'communication', 'problem solving'],
                'italian_level' => 'b1',
                'english_level' => null,
                'experience_years' => 0,
            ],
            [
                'id' => 'ikea-360166',
                'title' => 'Addetto/a alla Vendita - Part time',
                'company' => 'IKEA',
                'location' => 'Carugate, Milano, Lombardia',
                'city' => 'carugate',
                'category' => 'retail',
                'type' => 'part_time',
                'url' => 'https://jobs.ikea.com/en/job/carugate/addetto-a-alla-vendita-part-time/24107/99059323984',
                'description' => 'IKEA — part-time retail sales role in Carugate. Helps customers identify needs and choose home-furnishing solutions, maintains product presentation and pricing, and supports store sales goals. The employer lists a gross annual salary reference of €23,241.12 prorated to the part-time percentage; fixed-term contract and shifts including weekends.',
                'salary' => 23241.12,
                'published_at' => '2026-08-11 00:00:00',
                'skills' => ['retail sales', 'customer service', 'product presentation', 'teamwork'],
                'italian_level' => 'b1',
                'english_level' => null,
                'experience_years' => 0,
            ],
        ];

        $publishLocally = app()->environment('local', 'testing');

        foreach ($jobs as $job) {
            $cityId = City::where('slug', $job['city'])->value('id');
            $attrs = [
                'job_source_id' => $source->id,
                'external_id' => $job['id'],
                'title' => $job['title'],
                'company' => $job['company'],
                'city_id' => $cityId,
                'location_text' => $job['location'],
                'remote_mode' => 'onsite',
                'employment_type' => $job['type'],
                'category' => $job['category'],
                'salary_min' => $job['salary'],
                'salary_max' => $job['salary'],
                'salary_currency' => 'EUR',
                'salary_period' => 'year',
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
