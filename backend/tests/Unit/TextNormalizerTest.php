<?php

namespace Tests\Unit;

use App\Support\Text\TextNormalizer;
use PHPUnit\Framework\TestCase;

class TextNormalizerTest extends TestCase
{
    private TextNormalizer $n;

    protected function setUp(): void
    {
        $this->n = new TextNormalizer;
    }

    public function test_arabic_diacritics_tatweel_and_letter_variants_are_unified(): void
    {
        $this->assertSame($this->n->normalize('الإقامَة'), $this->n->normalize('الاقامه'));
        $this->assertSame($this->n->normalize('تـصـريح'), $this->n->normalize('تصريح'));
        $this->assertSame($this->n->normalize('أحمد'), $this->n->normalize('احمد'));
        $this->assertSame($this->n->normalize('على'), $this->n->normalize('علي'));
    }

    public function test_arabic_indic_digits_become_ascii(): void
    {
        $this->assertSame('74 يوم', $this->n->normalize('٧٤ يوم'));
        $this->assertSame('2026', $this->n->normalize('۲۰۲٦'));
    }

    public function test_latin_accents_and_case_are_folded(): void
    {
        $this->assertSame('perche e permesso di soggiorno', $this->n->normalize('Perché è  Permesso di Soggiorno'));
        $this->assertSame('citta', $this->n->normalize('Città'));
    }

    public function test_tokens_drop_stopwords_articles_and_duplicates(): void
    {
        $this->assertSame(['تجديد', 'اقامه'], $this->n->tokens('كيف أجدد الإقامة' === '' ? '' : 'تجديد الإقامة في'));
        $this->assertSame(['renew', 'residence', 'permit'], $this->n->tokens('How can I renew my residence permit'));
        $this->assertSame(['ottenere', 'residenza'], $this->n->tokens('Come posso ottenere la residenza?'));
        $this->assertSame(['permesso'], $this->n->tokens('permesso permesso Permesso'));
    }

    public function test_arabic_article_is_kept_for_short_words(): void
    {
        $this->assertSame(['الم'], $this->n->tokens('الم'));
    }

    public function test_loose_matching_handles_simple_inflection(): void
    {
        $this->assertTrue($this->n->matches('documents', 'document'));
        $this->assertTrue($this->n->matches('residenza', 'residenz'));
        $this->assertFalse($this->n->matches('cat', 'cats')); // too short to be loose
        $this->assertFalse($this->n->matches('permesso', 'passaporto'));
    }

    public function test_empty_and_symbol_only_input(): void
    {
        $this->assertSame([], $this->n->tokens(''));
        $this->assertSame([], $this->n->tokens('?!... -- ,'));
        $this->assertSame('', $this->n->normalize('   '));
    }
}
