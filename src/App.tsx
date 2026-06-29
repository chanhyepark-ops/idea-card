import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

type IdeaRow = {
  id: string
  content: string
  created_at: string
}

type Idea = {
  id: string
  content: string
  isEditing: boolean
  draft: string
}

function App() {
  const [draft, setDraft] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    void fetchIdeas()
  }, [])

  const toIdeaCard = (idea: IdeaRow): Idea => ({
    id: idea.id,
    content: idea.content,
    draft: idea.content,
    isEditing: false,
  })

  const fetchIdeas = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('ideas')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(
        '아이디어를 불러오지 못했습니다. Supabase에 `ideas` 테이블과 정책이 있는지 확인해 주세요.',
      )
      setIsLoading(false)
      return
    }

    setIdeas((data ?? []).map(toIdeaCard))
    setIsLoading(false)
  }

  const addIdea = async () => {
    const content = draft.trim()

    if (!content || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('ideas')
      .insert({ content })
      .select('id, content, created_at')
      .single()

    if (error) {
      setErrorMessage('아이디어를 저장하지 못했습니다. 다시 시도해 주세요.')
      setIsSubmitting(false)
      return
    }

    setIdeas((current) => [toIdeaCard(data), ...current])
    setDraft('')
    setIsSubmitting(false)
  }

  const startEdit = (id: string) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? { ...idea, isEditing: true, draft: idea.content }
          : idea,
      ),
    )
  }

  const updateIdeaDraft = (id: string, value: string) => {
    setIdeas((current) =>
      current.map((idea) => (idea.id === id ? { ...idea, draft: value } : idea)),
    )
  }

  const saveIdea = async (id: string) => {
    const targetIdea = ideas.find((idea) => idea.id === id)

    if (!targetIdea || isSubmitting) {
      return
    }

    const nextContent = targetIdea.draft.trim()

    if (!nextContent) {
      setErrorMessage('빈 내용으로는 저장할 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const { error } = await supabase
      .from('ideas')
      .update({ content: nextContent })
      .eq('id', id)

    if (error) {
      setErrorMessage('아이디어를 수정하지 못했습니다. 다시 시도해 주세요.')
      setIsSubmitting(false)
      return
    }

    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              content: nextContent,
              draft: nextContent,
              isEditing: false,
            }
          : idea,
      ),
    )
    setIsSubmitting(false)
  }

  const cancelEdit = (id: string) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? { ...idea, isEditing: false, draft: idea.content }
          : idea,
      ),
    )
  }

  const deleteIdea = async (id: string) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const { error } = await supabase.from('ideas').delete().eq('id', id)

    if (error) {
      setErrorMessage('아이디어를 삭제하지 못했습니다. 다시 시도해 주세요.')
      setIsSubmitting(false)
      return
    }

    setIdeas((current) => current.filter((idea) => idea.id !== id))
    setIsSubmitting(false)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="eyebrow">Idea board</div>
        <h1>생각을 카드처럼 쌓아보세요</h1>
        <p className="hero-copy">
          입력창에 아이디어를 적고 저장하면 카드가 생성됩니다. 카드는 수정과
          삭제가 가능합니다.
        </p>

        <div className="composer">
          <label className="field-label" htmlFor="idea-input">
            새 아이디어
          </label>
          <textarea
            id="idea-input"
            className="composer-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="예: 신규 캠페인 제목, 썸네일 문구, 랜딩페이지 카피..."
            rows={5}
          />
          <div className="composer-actions">
            <span className="hint">
              Supabase와 연결된 아이디어 보드입니다.
            </span>
            <button
              type="button"
              className="primary-button"
              onClick={() => void addIdea()}
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
          {errorMessage ? <p className="status-message error">{errorMessage}</p> : null}
        </div>
      </section>

      <section className="board-panel" aria-label="아이디어 보드">
        <div className="board-header">
          <div>
            <div className="section-label">Idea board</div>
            <h2>저장된 카드</h2>
          </div>
          <div className="card-count">{ideas.length} cards</div>
        </div>

        {isLoading ? (
          <div className="empty-state">아이디어를 불러오는 중입니다...</div>
        ) : ideas.length === 0 ? (
          <div className="empty-state">
            아직 카드가 없습니다. 왼쪽에 아이디어를 입력하고 저장해 보세요.
          </div>
        ) : (
          <div className="card-grid">
            {ideas.map((idea) => (
              <article key={idea.id} className="idea-card">
                {idea.isEditing ? (
                  <>
                    <textarea
                      className="card-editor"
                      value={idea.draft}
                      onChange={(event) =>
                        updateIdeaDraft(idea.id, event.target.value)
                      }
                      rows={6}
                    />
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => cancelEdit(idea.id)}
                        disabled={isSubmitting}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => void saveIdea(idea.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="card-content">{idea.content}</p>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEdit(idea.id)}
                        disabled={isSubmitting}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void deleteIdea(idea.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '삭제'}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
