"use client";

import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { listCourses } from "@/lib/decks";

function sectionCount(count: number) {
  return count === 1 ? "1 section" : `${count} sections`;
}

export function DeckHome() {
  const courses = listCourses();

  return (
    <Stack gap={5} width="100%">
      <Stack gap={2} maxWidth="40rem">
        <Heading level={1} textWrap="balance">
          Classes
        </Heading>
        <Text type="body" color="secondary" textWrap="pretty">
          Pick a class, then a section inside it. Progress is saved in this
          browser.
        </Text>
      </Stack>
      <Divider />
      <Grid columns={{ minWidth: 280, max: 3, repeat: "fit" }} gap={4} width="100%" align="start">
        {courses.map((course) => (
          <ClickableCard
            key={course.slug}
            href={`/${course.slug}`}
            label={`${course.title}, ${sectionCount(course.sections.length)}`}
            variant="gray"
            padding={6}
            elevation="med"
            width="100%"
            className="bg-(--color-accent)! text-(--color-on-accent)! p-4! sm:p-(--spacing-6)!"
          >
            <Stack gap={4}>
              <HStack gap={3} align="end" justify="between" wrap="wrap">
                <Heading
                  level={2}
                  type="display-2"
                  weight="semibold"
                  color="inherit"
                  textWrap="balance"
                  className="text-[clamp(1.75rem,7vw,2.1875rem)]! leading-[1.15]! font-semibold!"
                >
                  {course.title}
                </Heading>
                <Text type="supporting" color="inherit" hasTabularNumbers>
                  {sectionCount(course.sections.length)}
                </Text>
              </HStack>
              <Text type="large" color="inherit" textWrap="pretty">
                {course.description}
              </Text>
            </Stack>
          </ClickableCard>
        ))}
      </Grid>
    </Stack>
  );
}
