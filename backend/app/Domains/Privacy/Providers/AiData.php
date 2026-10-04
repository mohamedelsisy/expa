<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Models\AiMessage;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AiData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'ai_conversations';
    }

    public function export(User $user): array
    {
        return AiConversation::where('user_id', $user->id)->with('messages')->orderBy('id')->get()->map(fn ($c) => [
            'title' => $c->title,
            'locale' => $c->locale,
            'created_at' => $c->created_at?->toIso8601String(),
            'messages' => $c->messages->map(fn ($m) => [
                'role' => $m->role,
                'content' => $m->content,
                'label' => $m->label,
                'at' => $m->created_at?->toIso8601String(),
            ])->all(),
        ])->all();
    }

    public function erase(User $user): void
    {
        AiMessage::where('user_id', $user->id)->delete();
        AiConversation::where('user_id', $user->id)->delete();
        DB::table('ai_usage')->where('user_id', $user->id)->delete();
    }
}
