/**
 * UI 컴포넌트 가이드 페이지
 * - 프로젝트에서 사용 가능한 모든 UI 컴포넌트 예시
 * - Button, Input, Select, Checkbox, Radio, Switch, Badge, Alert, Tabs 등
 * - 폼 예시와 ConfirmDialog 예시 포함
 */

"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Mail,
  Lock,
  User,
  Search
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { FormField } from "@/components/FormField"

/** 폼 예시용 유효성 스키마 */
const formSchema = z.object({
  username: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일을 입력하세요"),
  bio: z.string().optional(),
  category: z.string().min(1, "카테고리를 선택하세요"),
  notifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  terms: z.boolean().refine((val) => val === true, "약관에 동의해야 합니다"),
})

type FormData = z.infer<typeof formSchema>

export default function UIComponentsPage() {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [switchValue, setSwitchValue] = React.useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      category: "",
      notifications: true,
      theme: "system",
      terms: false,
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card-container">
          <div className="card-header">
            <div>
              <h1 className="page-title">UI 컴포넌트 가이드</h1>
              <p className="page-description">
                프로젝트에서 사용 가능한 기본 UI 컴포넌트들의 예제입니다.
              </p>
            </div>
          </div>
          <div className="card-body">
            <Tabs defaultValue="inputs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inputs">입력 요소</TabsTrigger>
            <TabsTrigger value="buttons">버튼</TabsTrigger>
            <TabsTrigger value="feedback">피드백</TabsTrigger>
            <TabsTrigger value="display">표시 요소</TabsTrigger>
            <TabsTrigger value="form">폼 예제</TabsTrigger>
          </TabsList>

          {/* 입력 요소 탭 */}
          <TabsContent value="inputs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Input (텍스트 입력)</CardTitle>
                  <CardDescription>기본 텍스트 입력 필드</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-default">기본 입력</Label>
                    <Input id="input-default" placeholder="텍스트를 입력하세요" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-disabled">비활성화</Label>
                    <Input id="input-disabled" placeholder="비활성화됨" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-icon">아이콘 포함</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="input-icon" placeholder="검색..." className="pl-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Textarea */}
              <Card>
                <CardHeader>
                  <CardTitle>Textarea (텍스트 영역)</CardTitle>
                  <CardDescription>여러 줄 텍스트 입력</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="textarea-default">기본</Label>
                    <Textarea id="textarea-default" placeholder="내용을 입력하세요" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-disabled">비활성화</Label>
                    <Textarea id="textarea-disabled" placeholder="비활성화됨" disabled />
                  </div>
                </CardContent>
              </Card>

              {/* Select */}
              <Card>
                <CardHeader>
                  <CardTitle>Select (선택 상자)</CardTitle>
                  <CardDescription>드롭다운 선택 메뉴</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>카테고리 선택</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">프론트엔드</SelectItem>
                        <SelectItem value="backend">백엔드</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="design">디자인</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>비활성화</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="비활성화됨" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option">옵션</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Checkbox */}
              <Card>
                <CardHeader>
                  <CardTitle>Checkbox (체크박스)</CardTitle>
                  <CardDescription>다중 선택 옵션</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" />
                    <Label htmlFor="check1">이메일 알림 받기</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" defaultChecked />
                    <Label htmlFor="check2">SMS 알림 받기</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check3" disabled />
                    <Label htmlFor="check3" className="text-gray-400">비활성화됨</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check4" disabled defaultChecked />
                    <Label htmlFor="check4" className="text-gray-400">체크 + 비활성화</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Radio Group */}
              <Card>
                <CardHeader>
                  <CardTitle>Radio Group (라디오 버튼)</CardTitle>
                  <CardDescription>단일 선택 옵션</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="option1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <Label htmlFor="r1">옵션 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <Label htmlFor="r2">옵션 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="r3" />
                      <Label htmlFor="r3">옵션 3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option4" id="r4" disabled />
                      <Label htmlFor="r4" className="text-gray-400">비활성화됨</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Switch */}
              <Card>
                <CardHeader>
                  <CardTitle>Switch (토글 스위치)</CardTitle>
                  <CardDescription>ON/OFF 토글</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="switch1">알림 활성화</Label>
                    <Switch 
                      id="switch1" 
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    현재 상태: {switchValue ? "켜짐" : "꺼짐"}
                  </p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="switch2">다크 모드</Label>
                    <Switch id="switch2" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="switch3" className="text-gray-400">비활성화</Label>
                    <Switch id="switch3" disabled />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 버튼 탭 */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants (버튼 변형)</CardTitle>
                <CardDescription>다양한 스타일의 버튼</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>기본 변형</Label>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>크기 변형</Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><User className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex flex-wrap gap-4">
                    <Button>활성화</Button>
                    <Button disabled>비활성화</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>아이콘 포함</Label>
                  <div className="flex flex-wrap gap-4">
                    <Button>
                      <Mail className="mr-2 h-4 w-4" /> 이메일 전송
                    </Button>
                    <Button variant="outline">
                      <Lock className="mr-2 h-4 w-4" /> 비밀번호 변경
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confirm Dialog (확인 다이얼로그)</CardTitle>
                <CardDescription>사용자 확인이 필요한 작업에 사용</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                  삭제하기
                </Button>
                <ConfirmDialog
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  title="정말 삭제하시겠습니까?"
                  description="이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다."
                  confirmText="삭제"
                  cancelText="취소"
                  variant="destructive"
                  onConfirm={() => {
                    alert("삭제되었습니다!")
                    setConfirmOpen(false)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 피드백 탭 */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert (알림)</CardTitle>
                <CardDescription>사용자에게 메시지를 전달하는 알림 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>알림</AlertTitle>
                  <AlertDescription>
                    기본 알림 메시지입니다. 일반적인 정보를 전달할 때 사용합니다.
                  </AlertDescription>
                </Alert>
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>성공</AlertTitle>
                  <AlertDescription>
                    작업이 성공적으로 완료되었습니다.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>경고</AlertTitle>
                  <AlertDescription>
                    주의가 필요한 상황입니다. 진행하기 전에 확인하세요.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>오류</AlertTitle>
                  <AlertDescription>
                    오류가 발생했습니다. 다시 시도해주세요.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badge (배지)</CardTitle>
                <CardDescription>상태나 카테고리를 나타내는 라벨</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 표시 요소 탭 */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Card (카드)</CardTitle>
                <CardDescription>콘텐츠를 그룹화하는 컨테이너</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>카드 제목</CardTitle>
                      <CardDescription>카드 설명 텍스트</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        카드 내용이 여기에 들어갑니다. 다양한 콘텐츠를 담을 수 있습니다.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-blue-700">커스텀 스타일</CardTitle>
                      <CardDescription className="text-blue-600">
                        색상을 커스터마이징할 수 있습니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-600">
                        Tailwind 클래스로 스타일을 변경할 수 있습니다.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs (탭)</CardTitle>
                <CardDescription>콘텐츠를 탭으로 구분하여 표시</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1">
                  <TabsList>
                    <TabsTrigger value="tab1">탭 1</TabsTrigger>
                    <TabsTrigger value="tab2">탭 2</TabsTrigger>
                    <TabsTrigger value="tab3">탭 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="p-4 border rounded-md mt-2">
                    첫 번째 탭의 내용입니다.
                  </TabsContent>
                  <TabsContent value="tab2" className="p-4 border rounded-md mt-2">
                    두 번째 탭의 내용입니다.
                  </TabsContent>
                  <TabsContent value="tab3" className="p-4 border rounded-md mt-2">
                    세 번째 탭의 내용입니다.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 폼 예제 탭 */}
          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>폼 예제</CardTitle>
                <CardDescription>
                  React Hook Form + Zod를 사용한 폼 유효성 검사 예제
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <FormField<FormData>
                    control={control}
                    label="사용자 이름"
                    name="username"
                    placeholder="이름을 입력하세요"
                    required
                  />

                  <FormField<FormData>
                    control={control}
                    label="이메일"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                  />

                  <FormField<FormData>
                    control={control}
                    label="자기소개"
                    name="bio"
                    type="textarea"
                    placeholder="자기소개를 입력하세요"
                  />

                  <div className="space-y-2">
                    <Label>카테고리 *</Label>
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">프론트엔드</SelectItem>
                        <SelectItem value="backend">백엔드</SelectItem>
                        <SelectItem value="fullstack">풀스택</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>테마 선택</Label>
                    <RadioGroup 
                      defaultValue="system"
                      onValueChange={(value) => setValue("theme", value as "light" | "dark" | "system")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light">라이트</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark">다크</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="theme-system" />
                        <Label htmlFor="theme-system">시스템 설정</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">알림 수신</Label>
                    <Switch 
                      id="notifications"
                      checked={watch("notifications")}
                      onCheckedChange={(checked) => setValue("notifications", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={watch("terms")}
                        onCheckedChange={(checked) => setValue("terms", checked as boolean)}
                      />
                      <Label 
                        htmlFor="terms" 
                        className={errors.terms ? "text-red-500" : ""}
                      >
                        이용약관에 동의합니다 *
                      </Label>
                    </div>
                    {errors.terms && (
                      <p className="text-sm text-red-500">{errors.terms.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">제출하기</Button>
                    <Button type="button" variant="outline">취소</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
