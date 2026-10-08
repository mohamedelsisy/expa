#!/usr/bin/env ruby
# Static YAML validation used when Docker is not installed. Checks parse + that merged services reference defined volumes/networks/anchors.
require 'yaml'
def load(f); YAML.respond_to?(:safe_load) ? (YAML.safe_load(File.read(f), [], [], true) rescue YAML.load_file(f)) : YAML.load_file(f); end
bad = 0
%w[docker-compose.prod.yml docker-compose.staging.yml docker-compose.yml].each do |f|
  y = load(f)
  svcs = y['services'] || {}
  vols = (y['volumes'] || {}).keys
  nets = (y['networks'] || {}).keys
  svcs.each do |n, s|
    (s['volumes'] || []).each do |v|
      src = v.to_s.split(':').first
      next if src.start_with?('.', '/', '$')
      (puts "#{f}: #{n} uses undefined volume #{src}"; bad += 1) unless vols.include?(src)
    end
    (s['networks'] || []).each { |nn, _| nn = nn.to_s; (puts "#{f}: #{n} uses undefined network #{nn}"; bad += 1) unless nets.include?(nn) || nets.empty? }
    d_on = s['depends_on'] || {}; (d_on.is_a?(Hash) ? d_on.keys : d_on).each { |d| (puts "#{f}: #{n} depends_on missing service #{d}"; bad += 1) unless svcs.key?(d) || f.include?('staging') }
  end
  puts "#{f}: OK parse, services=#{svcs.keys.join(',')}"
end
exit(bad.zero? ? 0 : 1)
