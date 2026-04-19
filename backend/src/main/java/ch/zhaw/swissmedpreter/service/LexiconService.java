package ch.zhaw.swissmedpreter.service;

import ch.zhaw.swissmedpreter.model.LexiconEntry;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LexiconService {
    private List<LexiconEntry> lexicon = new ArrayList<>();

    public LexiconService() {
        loadLexicon();
    }

    private void loadLexicon() {
        try {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            getClass().getClassLoader().getResourceAsStream("lexicon.json")
                    )
            );
            StringBuilder jsonContent = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonContent.append(line);
            }
            reader.close();

            Gson gson = new Gson();
            Type listType = new TypeToken<ArrayList<LexiconEntry>>(){}.getType();
            lexicon = gson.fromJson(jsonContent.toString(), listType);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<LexiconEntry> search(String term) {
        if (term == null || term.isEmpty()) {
            return new ArrayList<>();
        }
        String lowerCaseTerm = term.toLowerCase();
        return lexicon.stream()
                .filter(entry ->
                    entry.getGerman().toLowerCase().contains(lowerCaseTerm) ||
                    entry.getEnglish().toLowerCase().contains(lowerCaseTerm)
                )
                .collect(Collectors.toList());
    }

    public List<LexiconEntry> getAll() {
        return new ArrayList<>(lexicon);
    }
}
